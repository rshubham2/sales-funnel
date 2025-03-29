<!-- src/components/sales/POCForm.svelte -->
<script>
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { toast } from '@zerodevx/svelte-toast';
  
  export let organizationId;
  export let mode = 'create'; // create or view
  
  let loading = true;
  let saving = false;
  let editing = mode === 'create';
  let pocData = {
    totalSites: 0,
    productDetail: '',
    POCDuration: '',
    POCType: '',
    businessSites: 0,
    businessValue: 0,
    MRR: 0,
    hardwareSites: 0,
    avgHardwareValue: 0,
    hardwareValue: 0,
    POCStatus: 'IN_PROGRESS',
    dropReason: '',
    lossReason: ''
  };
  
  let followups = [];
  let newFollowup = {
    remark: '',
    followupDate: new Date().toISOString().split('T')[0]
  };
  
  onMount(async () => {
    if (mode === 'view') {
      await fetchPOCData();
    }
    loading = false;
  });
  
  async function fetchPOCData() {
    try {
      const response = await fetch(`/api/sales/poc/${organizationId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          // POC not found, this is a create scenario
          mode = 'create';
          editing = true;
          return;
        }
        throw new Error('Failed to fetch POC data');
      }
      
      const data = await response.json();
      pocData = {
        ...data,
        // Format dates for input elements
        stageEntryDate: data.stageEntryDate ? new Date(data.stageEntryDate).toISOString().split('T')[0] : null
      };
      
      // Fetch followups separately
      const followupsResponse = await fetch(`/api/sales/poc/${organizationId}/followups`);
      if (followupsResponse.ok) {
        followups = await followupsResponse.json();
        // Format dates for display
        followups = followups.map(f => ({
          ...f,
          followupDate: new Date(f.followupDate).toISOString().split('T')[0]
        }));
      }
    } catch (error) {
      console.error('Error fetching POC data:', error);
      toast.push('Failed to load POC data', { classes: ['error'] });
    }
  }
  
  async function handleSubmit() {
    saving = true;
    
    try {
      // Calculate hardwareValue based on hardwareSites and avgHardwareValue
      pocData.hardwareValue = pocData.hardwareSites * pocData.avgHardwareValue;
      
      const url = `/api/sales/poc/${organizationId}`;
      const method = mode === 'create' ? 'POST' : 'PUT';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pocData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to ${mode} POC data`);
      }
      
      const savedPOC = await response.json();
      
      if (mode === 'create') {
        // If creating, update mode and reload data
        mode = 'view';
        await fetchPOCData();
        toast.push('POC created successfully', { classes: ['success'] });
      } else {
        toast.push('POC updated successfully', { classes: ['success'] });
      }
      
      // If moving to next stage, update the organization's sales stage
      if (pocData.POCStatus === 'MOVED_TO_NEXT') {
        await updateOrganizationStage();
      }
      
      editing = false;
    } catch (error) {
      console.error('Error saving POC:', error);
      toast.push('Failed to save POC data', { classes: ['error'] });
    } finally {
      saving = false;
    }
  }
  
async function updateOrganizationStage() {
  try {
    const response = await fetch(`/api/sales/organization/${organizationId}/stage`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stage: 'PROPOSAL' }) // Use 'stage' instead of 'salesStage'
    });
    
    if (!response.ok) {
      throw new Error('Failed to update organization stage');
    }
    
    toast.push('Organization moved to Proposal stage', { classes: ['success'] });
  } catch (error) {
    console.error('Error updating organization stage:', error);
    toast.push('Failed to update sales stage', { classes: ['error'] });
  }
}
  
  async function addFollowup() {
    if (!newFollowup.remark || !newFollowup.followupDate) {
      toast.push('Please fill all followup fields', { classes: ['warning'] });
      return;
    }
    
    try {
      const response = await fetch(`/api/sales/poc/${organizationId}/followup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFollowup)
      });
      
      if (!response.ok) {
        throw new Error('Failed to add followup');
      }
      
      const savedFollowup = await response.json();
      followups = [...followups, {
        ...savedFollowup,
        followupDate: new Date(savedFollowup.followupDate).toISOString().split('T')[0]
      }];
      
      // Reset the form
      newFollowup = {
        remark: '',
        followupDate: new Date().toISOString().split('T')[0]
      };
      
      toast.push('Followup added successfully', { classes: ['success'] });
    } catch (error) {
      console.error('Error adding followup:', error);
      toast.push('Failed to add followup', { classes: ['error'] });
    }
  }
  
  function toggleEdit() {
    editing = !editing;
  }
  
  // Determine if fields should be disabled
  $: isDisabled = !editing || pocData.POCStatus === 'MOVED_TO_NEXT';
  
  // Show/hide reason fields based on status
  $: showDropReason = pocData.POCStatus === 'DROPPED';
  $: showLossReason = pocData.POCStatus === 'HOLD';
</script>

<div class="poc-form-container">
  <h2>{mode === 'create' ? 'Create New POC' : 'POC Details'}</h2>
  
  {#if loading}
    <div class="loading">Loading POC data...</div>
  {:else}
    <form on:submit|preventDefault={handleSubmit}>
      <div class="form-grid">
        <div class="form-group">
          <label for="totalSites">Total Sites for POC</label>
          <input 
            type="number" 
            id="totalSites" 
            bind:value={pocData.totalSites} 
            disabled={isDisabled}
            required
          />
        </div>
        
        <div class="form-group">
          <label for="productDetail">Product Details</label>
          <select 
            id="productDetail" 
            bind:value={pocData.productDetail} 
            disabled={isDisabled}
            required
          >
            <option value="">Select Product</option>
            <option value="CCTV Supply & Installation">CCTV Supply & Installation</option>
            <option value="CCTV Doctor">CCTV Doctor</option>
            <option value="CCTV Live">CCTV Live</option>
            <option value="CCTV Virtual Watchdog">CCTV Virtual Watchdog</option>
            <option value="CCTV Eye Q">CCTV Eye Q</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="POCDuration">POC Duration</label>
          <input 
            type="text" 
            id="POCDuration" 
            bind:value={pocData.POCDuration} 
            disabled={isDisabled}
            required
          />
        </div>
        
        <div class="form-group">
          <label for="POCType">POC Status</label>
          <select 
            id="POCType" 
            bind:value={pocData.POCType} 
            disabled={isDisabled}
            required
          >
            <option value="">Select POC Type</option>
            <option value="Chargeable">Chargeable</option>
            <option value="FOC">FOC</option>
          </select>
        </div>
        
        <div class="form-group">
          <label for="businessSites">Total Business Sites</label>
          <input 
            type="number" 
            id="businessSites" 
            bind:value={pocData.businessSites} 
            disabled={isDisabled}
            required
          />
        </div>
        
        <div class="form-group">
          <label for="businessValue">Total Business Value</label>
          <input 
            type="number" 
            id="businessValue" 
            bind:value={pocData.businessValue} 
            disabled={isDisabled}
            required
          />
        </div>
        
        <div class="form-group">
          <label for="MRR">Total MRR</label>
          <input 
            type="number" 
            id="MRR" 
            bind:value={pocData.MRR} 
            disabled={isDisabled}
            required
          />
        </div>
        
        <div class="form-group">
          <label for="hardwareSites">Total Hardware Sites</label>
          <input 
            type="number" 
            id="hardwareSites" 
            bind:value={pocData.hardwareSites} 
            disabled={isDisabled}
            required
          />
        </div>
        
        <div class="form-group">
          <label for="avgHardwareValue">Per Site Avg. Hardware Value</label>
          <input 
            type="number" 
            id="avgHardwareValue" 
            bind:value={pocData.avgHardwareValue} 
            disabled={isDisabled}
            required
          />
        </div>
        
        <div class="form-group">
          <label for="hardwareValue">Total Hardware Value</label>
          <input 
            type="number" 
            id="hardwareValue" 
            value={pocData.hardwareSites * pocData.avgHardwareValue} 
            disabled={true}
            readonly
          />
        </div>
        
        <div class="form-group">
          <label for="POCStatus">POC Status</label>
          <select 
            id="POCStatus" 
            bind:value={pocData.POCStatus} 
            disabled={isDisabled}
            required
          >
            <option value="IN_PROGRESS">In Progress</option>
            <option value="MOVED_TO_NEXT">Move to Next Stage</option>
            <option value="DROPPED">Dropped</option>
            <option value="HOLD">Hold</option>
          </select>
        </div>
        
        {#if showDropReason}
          <div class="form-group span-2">
            <label for="dropReason">Reason for Dropped</label>
            <textarea 
              id="dropReason" 
              bind:value={pocData.dropReason} 
              disabled={isDisabled}
              required={showDropReason}
            ></textarea>
          </div>
        {/if}
        
        {#if showLossReason}
          <div class="form-group span-2">
            <label for="lossReason">Reason for Hold</label>
            <textarea 
              id="lossReason" 
              bind:value={pocData.lossReason} 
              disabled={isDisabled}
              required={showLossReason}
            ></textarea>
          </div>
        {/if}
      </div>
      
      {#if editing}
        <div class="form-actions">
          <button type="submit" class="btn primary" disabled={saving}>
            {saving ? 'Saving...' : 'Save POC Details'}
          </button>
          {#if mode === 'view'}
            <button type="button" class="btn secondary" on:click={toggleEdit}>Cancel</button>
          {/if}
        </div>
      {:else}
        <div class="form-actions">
          <button type="button" class="btn primary" on:click={toggleEdit}>Edit POC Details</button>
          <button type="button" class="btn secondary" on:click={() => goto(`/sales/organization/${organizationId}`)}>
            Back to Organization
          </button>
        </div>
      {/if}
    </form>
    
    <!-- Followups Section -->
    <div class="followups-section">
      <h3>Follow-ups</h3>
      
      {#if followups.length > 0}
        <div class="followups-list">
          {#each followups as followup}
            <div class="followup-item">
              <div class="followup-date">{new Date(followup.followupDate).toLocaleDateString()}</div>
              <div class="followup-remark">{followup.remark}</div>
            </div>
          {/each}
        </div>
      {:else}
        <p>No followups yet.</p>
      {/if}
      
      <div class="add-followup-form">
        <h4>Add New Followup</h4>
        <div class="form-group">
          <label for="followupDate">Followup Date</label>
          <input 
            type="date" 
            id="followupDate" 
            bind:value={newFollowup.followupDate}
            disabled={pocData.POCStatus === 'MOVED_TO_NEXT'}
          />
        </div>
        
        <div class="form-group">
          <label for="followupRemark">Remark</label>
          <textarea 
            id="followupRemark" 
            bind:value={newFollowup.remark}
            disabled={pocData.POCStatus === 'MOVED_TO_NEXT'}
          ></textarea>
        </div>
        
        <button 
          type="button" 
          class="btn add-followup" 
          on:click={addFollowup}
          disabled={pocData.POCStatus === 'MOVED_TO_NEXT'}
        >
          Add Followup
        </button>
      </div>
    </div>
  {/if}
</div>

<style>
  .poc-form-container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 20px;
  }
  
  h2 {
    margin-bottom: 20px;
    color: #333;
  }
  
  .loading {
    text-align: center;
    padding: 20px;
    font-style: italic;
  }
  
  .form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 30px;
  }
  
  .span-2 {
    grid-column: span 2;
  }
  
  .form-group {
    margin-bottom: 15px;
  }
  
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
  }
  
  input, select, textarea {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 1rem;
  }
  
  textarea {
    min-height: 100px;
    resize: vertical;
  }
  
  input:disabled, select:disabled, textarea:disabled {
    background-color: #f9f9f9;
    cursor: not-allowed;
  }
  
  .form-actions {
    display: flex;
    gap: 10px;
    margin-bottom: 30px;
  }
  
  .btn {
    padding: 10px 15px;
    border: none;
    border-radius: 4px;
    font-size: 1rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  
  .btn.primary {
    background-color: #4a6ee0;
    color: white;
  }
  
  .btn.secondary {
    background-color: #f0f0f0;
    color: #333;
  }
  
  .btn.add-followup {
    background-color: #5cb85c;
    color: white;
  }
  
  .followups-section {
    margin-top: 40px;
    border-top: 1px solid #eee;
    padding-top: 20px;
  }
  
  .followups-list {
    margin-bottom: 20px;
  }
  
  .followup-item {
    padding: 10px;
    border: 1px solid #eee;
    border-radius: 4px;
    margin-bottom: 10px;
    display: flex;
    gap: 20px;
  }
  
  .followup-date {
    min-width: 120px;
    font-weight: 500;
  }
  
  .add-followup-form {
    background-color: #f9f9f9;
    padding: 15px;
    border-radius: 4px;
  }
</style>