<?if(get_data('exit')):?>
<script type="text/javascript">
	window.location = "/tao/Main/index?extension=users&message=<?=get_data('message')?>";
</script>
<?elseif(get_data('message')):?>
<div id="info-box" class="ui-widget-header ui-corner-all auto-slide">
	<span><?=get_data('message')?></span>
</div>
<?endif?>
<div class="main-container">
	<div id="form-title" class="ui-widget-header ui-corner-top ui-state-default">
		<?=get_data('formTitle')?>
	</div>
	<div id="form-container" class="ui-widget-content ui-corner-bottom ui-state-default">
		<?=get_data('myForm')?>
	</div>
	
	<br />
	<span class="ui-widget ui-state-default ui-corner-all" style="padding:5px;">
		<a href="#" onclick="selectTabByName('manage_users');"><?=__('Back')?></a>
	</span>
</div>
<script type="text/javascript">
var ctx_extension 	= "<?=get_data('extension')?>";
var ctx_module 		= "<?=get_data('module')?>";
var ctx_action 		= "<?=get_data('action')?>";
$(function(){

	<?if(get_data('action') != 'edit'):?>
		tabs.tabs('disable', getTabIndexByName('edit_user'));
	<?endif?>

	<?if(get_data('reload') === true):?>	
		loadControls();
	<?else:?>
		initActions();
	<?endif?>
});
</script>