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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA;
 */

namespace oat\tao\model\webhooks\log;

use common_persistence_Manager;
use Doctrine\DBAL\Query\QueryBuilder;
use oat\oatbox\log\LoggerAwareTrait;
use oat\oatbox\service\ConfigurableService;

class WebhookLogRepository extends ConfigurableService implements WebhookLogRepositoryInterface
{
    use LoggerAwareTrait;

    const OPTION_PERSISTENCE = 'persistence';

    /**
     * Constants for the database creation and data access
     */
    const TABLE_NAME = 'webhook_event_log';
    const COLUMN_ID = 'id';
    const COLUMN_EVENT_ID = 'event_id';
    const COLUMN_TASK_ID = 'task_id';
    const COLUMN_WEBHOOK_ID = 'webhook_id';
    const COLUMN_HTTP_METHOD = 'http_method';
    const COLUMN_ENDPOINT_URL = 'endpoint_url';
    const COLUMN_EVENT_NAME = 'event_name';
    const COLUMN_HTTP_STATUS_CODE = 'http_status_code';
    const COLUMN_RESPONSE_BODY = 'response_body';
    const COLUMN_ACKNOWLEDGEMENT_STATUS = 'acknowledgement_status';
    const COLUMN_CREATED_AT = 'created_at';
    const COLUMN_RESULT = 'result';
    const COLUMN_RESULT_MESSAGE = 'result_message';

    /**
     * @return \common_persistence_Persistence
     */
    private function getPersistence()
    {
        $persistenceId = $this->getOption(self::OPTION_PERSISTENCE) ?: 'default';
        /** @var common_persistence_Manager $persistenceManager */
        $persistenceManager = $this->getServiceManager()->get(common_persistence_Manager::SERVICE_ID);
        $this->persistence = $persistenceManager->getPersistenceById($persistenceId);
    }

    /**
     * @return QueryBuilder
     */
    private function getQueryBuilder()
    {
        return $this->getPersistence()->getPlatform()->getQueryBuilder();
    }

    /**
     * @inheritDoc
     */
    public function storeLog(WebhookEventLogRecord $webhookEventLog)
    {
        $this->getPersistence()->insert(self::TABLE_NAME, [
            self::COLUMN_EVENT_ID => $webhookEventLog->getEventId(),
            self::COLUMN_TASK_ID => $webhookEventLog->getTaskId(),
            self::COLUMN_WEBHOOK_ID => $webhookEventLog->getWebhookId(),
            self::COLUMN_HTTP_METHOD => $webhookEventLog->getHttpMethod(),
            self::COLUMN_ENDPOINT_URL => $webhookEventLog->getEndpointUrl(),
            self::COLUMN_EVENT_NAME => $webhookEventLog->getEventName(),
            self::COLUMN_HTTP_STATUS_CODE => $webhookEventLog->getHttpStatusCode(),
            self::COLUMN_RESPONSE_BODY => $webhookEventLog->getResponseBody(),
            self::COLUMN_ACKNOWLEDGEMENT_STATUS => $webhookEventLog->getAcknowledgementStatus(),
            self::COLUMN_CREATED_AT => $webhookEventLog->getCreatedAt(),
            self::COLUMN_RESULT => $webhookEventLog->getResult(),
            self::COLUMN_RESULT_MESSAGE => $webhookEventLog->getResultMessage(),
        ]);
    }
}
