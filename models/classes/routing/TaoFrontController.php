<?php
/**
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 *
 * Copyright (c) 2014 (original work) Open Assessment Technologies SA;
 *
 */
namespace oat\tao\model\routing;

use GuzzleHttp\Psr7\Response;
use GuzzleHttp\Psr7\ServerRequest;
use InterruptedActionException;
use common_ext_ExtensionsManager;
use common_http_Request;
use oat\oatbox\service\ServiceManagerAwareInterface;
use oat\oatbox\service\ServiceManagerAwareTrait;
use oat\tao\model\session\restSessionFactory\RestSessionFactory;
use Psr\Http\Message\ResponseInterface;
use Psr\Http\Message\ServerRequestInterface;

/**
 * A simple controller to replace the ClearFw controller
 *
 * @author Joel Bout, <joel@taotesting.com>
 */
class TaoFrontController implements ServiceManagerAwareInterface
{
    use ServiceManagerAwareTrait;

    /**
     * Resolve the request and enforce the responsible controller
     *
     * - Resolve request
     * - load the extension
     * - set the context
     * - load rest session if needed
     * - load the language
     * - enforce controller: $controller->$method()
     *
     * @param ServerRequestInterface $request
     * @param ResponseInterface $response
     * @throws \ActionEnforcingException
     * @throws \common_exception_Error
     * @throws \common_exception_InvalidArgumentType
     * @throws \common_ext_ExtensionException
     */
    public function __invoke(ServerRequestInterface $request, ResponseInterface $response)
    {
        $resolver = new Resolver($request);
        $this->propagate($resolver);

        // load the responsible extension
        $ext = $this->getServiceLocator()->get(common_ext_ExtensionsManager::SERVICE_ID)
            ->getExtensionById($resolver->getExtensionId());

        \Context::getInstance()->setExtensionName($resolver->getExtensionId());

        try {
            /** @var RestSessionFactory $service */
            $service = $this->getServiceLocator()->get(RestSessionFactory::SERVICE_ID);
            $pRequest = common_http_Request::currentRequest();
            $service->createSessionFromRequest($pRequest, $resolver);
        } catch (\common_user_auth_AuthFailedException $e) {
            $data['success']	= false;
            $data['errorCode']	= '401';
            $data['errorMsg']	= 'You are not authorized to access this functionality.';
            $data['version']	= TAO_VERSION;

            header('HTTP/1.0 401 Unauthorized');
            header('WWW-Authenticate: Basic realm="' . GENERIS_INSTANCE_NAME . '"');
            echo json_encode($data);
            exit(0);
        }

        // load translations
        $uiLang = \common_session_SessionManager::getSession()->getInterfaceLanguage();
        \tao_helpers_I18n::init($ext, $uiLang);

        try {
            if($request->getMethod() == 'GET') {
                $parameters = $request->getQueryParams();
            } else {
                $parameters = $request->getParsedBody();
            }
            $enforcer = new ActionEnforcer($resolver->getExtensionId(), $resolver->getControllerClass(), $resolver->getMethodName(), $parameters);
            $this->propagate($enforcer);
            $enforcer($request, $response);
        } catch (InterruptedActionException $iE) {
            // Nothing to do here.
        }
    }

    /**
     * Run the controller
     *
     * @deprecated use $this->__invoke() instead
     *
     * @param common_http_Request $pRequest
     * @throws \ActionEnforcingException
     * @throws \common_exception_Error
     * @throws \common_exception_InvalidArgumentType
     * @throws \common_ext_ExtensionException
     */
    public function legacy(common_http_Request $pRequest)
    {
        $request = ServerRequest::fromGlobals();
        $response = new Response();
        $this($request, $response);
    }
}
