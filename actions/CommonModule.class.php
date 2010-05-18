<?php
/**
 * Top level controller
 * All children extenions module should extends the CommonModule to access the shared data
 * 
 * @author CRP Henri Tudor - TAO Team - {@link http://www.tao.lu}
 * @license GPLv2  http://www.opensource.org/licenses/gpl-2.0.php
 * @package tao
 * @subpackage action
 */
abstract class CommonModule extends Module {

	/**
	 * The Modules access the models throught the service instance
	 * @var tao_models_classes_Service
	 */
	protected $service = null;
	
	/**
	 * constructor checks if a user is logged in
	 * If you don't want this check, please override the  _isAllowed method to return true
	 */
	public function __construct(){
		$errorMessage = __('Access denied. Please renew your authentication!');
		if(!$this->_isAllowed()){
			if(tao_helpers_Request::isAjax()){
				header("HTTP/1.0 403 Forbidden");
				echo $errorMessage;
				return;
			}
			throw new Exception($errorMessage);
		}
	}
	
	/**
	 * Retrieve the data from the url and make the base initialization
	 * @return void
	 */
	protected function defaultData(){
		$context = Context::getInstance();
		if($this->hasSessionAttribute('currentExtension')){
			$this->setData('extension', $this->getSessionAttribute('currentExtension'));
			$this->setData('module',  $context->getModuleName());
			$this->setData('action',  $context->getActionName());
			
			if($this->getRequestParameter('showNodeUri')){
				$this->setSessionAttribute("showNodeUri", $this->getRequestParameter('showNodeUri'));
			}
			if($this->getRequestParameter('uri') || $this->getRequestParameter('classUri')){
				if($this->getRequestParameter('uri')){
					$this->setSessionAttribute('uri', $this->getRequestParameter('uri'));
				}
				else{
					unset($_SESSION[SESSION_NAMESPACE]['uri']);
				}
				if($this->getRequestParameter('classUri')){
					$this->setSessionAttribute('classUri', $this->getRequestParameter('classUri'));
				}
				else{
					unset($_SESSION[SESSION_NAMESPACE]['classUri']);
				}
			}
		}
		else{
			unset($_SESSION[SESSION_NAMESPACE]['uri']);
			unset($_SESSION[SESSION_NAMESPACE]['classUri']);
		}
		
		if($this->getRequestParameter('message')){
			$this->setData('message', $this->getRequestParameter('message'));
		}
		if($this->getRequestParameter('errorMessage')){
			$this->setData('errorMessage', $this->getRequestParameter('errorMessage'));
		}
	}

	/**
	 * Check if the current user is allowed to acces the request
	 * Override this method to allow/deny a request
	 * @return boolean
	 */
	protected function _isAllowed(){
		return core_kernel_users_Service::singleton()->isASessionOpened();	//if a user is logged in
	}
	
}
?>