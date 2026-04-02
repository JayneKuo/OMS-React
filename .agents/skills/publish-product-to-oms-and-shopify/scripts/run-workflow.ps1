param(
  [Parameter(Mandatory = $true)]
  [string]$UserRequest,

  [string]$MerchantNo,
  [string]$OmsChannelNo,
  [string]$SourceChannel,
  [string]$SourceProductId,
  [string]$TargetChannel,
  [string]$Stage = "analyze",
  [switch]$OmsCreateSuccess,
  [switch]$ApproveChannelSync
)

function Detect-SourceChannel {
  param([string]$Text, [string]$Explicit)
  if ($Explicit) { return $Explicit.ToLower() }
  if ($Text -match 'shopify') { return 'shopify' }
  if ($Text -match 'tiktok') { return 'tiktok' }
  return 'shopify'
}

function Detect-TargetChannel {
  param([string]$Text, [string]$Explicit)
  if ($Explicit) { return $Explicit.ToLower() }
  if ($Text -match 'shopify') { return 'shopify' }
  if ($Text -match 'tiktok') { return 'tiktok' }
  return ''
}

function Detect-AuditState {
  param([string]$Text)
  if ($Text -match '草稿') { return 'draft' }
  if ($Text -match '上架|发布') { return 'listed' }
  return 'draft'
}

function Detect-AutoSync {
  param([string]$Text)
  return [bool]($Text -match '自动同步|自动发布|直接同步|直接发布')
}

function Detect-ProductId {
  param([string]$Text, [string]$Explicit)
  if ($Explicit) { return $Explicit }
  $m = [regex]::Match($Text, '(?<!\d)(\d{8,20})(?!\d)')
  if ($m.Success) { return $m.Groups[1].Value }
  return ''
}

function Build-NeedFieldList {
  param($Context)
  $missing = @()
  if (-not $Context.merchantNo) { $missing += 'merchantNo' }
  if (-not $Context.omsChannelNo) { $missing += 'channelNo' }
  if (-not $Context.sourceProductId) { $missing += 'sourceProductId' }
  return $missing
}

$context = [ordered]@{
  sourceChannel = Detect-SourceChannel -Text $UserRequest -Explicit $SourceChannel
  sourceProductId = Detect-ProductId -Text $UserRequest -Explicit $SourceProductId
  merchantNo = $MerchantNo
  omsChannelNo = $OmsChannelNo
  targetChannel = Detect-TargetChannel -Text $UserRequest -Explicit $TargetChannel
  auditState = Detect-AuditState -Text $UserRequest
  autoSync = Detect-AutoSync -Text $UserRequest
}

$result = [ordered]@{
  input = $UserRequest
  stage = $Stage
  context = $context
}

switch ($Stage.ToLower()) {
  'analyze' {
    $missing = Build-NeedFieldList -Context $context
    $result['missingFields'] = $missing

    if ($missing.Count -gt 0) {
      $prompts = @()
      if ($missing -contains 'merchantNo') { $prompts += 'Missing merchantNo. Please provide merchantNo.' }
      if ($missing -contains 'channelNo') { $prompts += 'Missing OMS channelNo. Please provide channelNo.' }
      if ($missing -contains 'sourceProductId') { $prompts += 'Missing source product id. Please provide product id, handle, or URL.' }

      $result['status'] = 'need_user_input'
      $result['assistantMessage'] = ($prompts -join ' ')
    }
    else {
      $result['status'] = 'ready_for_oms_create'
      $result['assistantMessage'] = 'Required fields for OMS creation are ready. Create in OMS first.'
    }
    break
  }

  'post-oms-create' {
    if (-not $OmsCreateSuccess) {
      $result['status'] = 'oms_create_failed'
      $result['assistantMessage'] = 'OMS create failed. Check the API response and required fields.'
    }
    else {
      $result['status'] = 'oms_create_succeeded'
      if ($context.targetChannel) {
        if ($context.autoSync -or $ApproveChannelSync) {
          $result['nextAction'] = 'proceed_channel_sync'
          $result['assistantMessage'] = "OMS create succeeded. Proceed to sync to $($context.targetChannel)."
        }
        else {
          $result['nextAction'] = 'ask_user_confirm_sync'
          $result['assistantMessage'] = "OMS create succeeded. Ask user whether to continue syncing to $($context.targetChannel)."
        }
      }
      else {
        $result['nextAction'] = 'done'
        $result['assistantMessage'] = 'OMS create succeeded. No external channel was requested.'
      }
    }
    break
  }

  'post-channel-sync' {
    if ($ApproveChannelSync) {
      $result['status'] = 'channel_sync_succeeded'
      $result['assistantMessage'] = "Channel sync succeeded for $($context.targetChannel)."
    }
    else {
      $result['status'] = 'channel_sync_failed'
      $result['assistantMessage'] = "Channel sync failed for $($context.targetChannel)."
    }
    break
  }

  default {
    $result['status'] = 'unknown_stage'
    $result['assistantMessage'] = 'Unsupported stage. Use analyze, post-oms-create, or post-channel-sync.'
  }
}

$result | ConvertTo-Json -Depth 10
