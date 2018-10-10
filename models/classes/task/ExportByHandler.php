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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA (under the project TAO-PRODUCT);
 *
 */

namespace oat\tao\model\task;

use common_report_Report as Report;
use oat\oatbox\extension\AbstractAction;
use oat\oatbox\filesystem\Directory;
use oat\oatbox\filesystem\FileSystemService;
use oat\tao\model\taskQueue\QueueDispatcherInterface;

class ExportByHandler extends AbstractAction
{
    const PARAM_EXPORT_HANDLER = 'export_handler';
    const PARAM_EXPORT_DATA = 'export_data';

    public function __invoke($params)
    {
        $this->validateParams($params);

        /** @var \tao_models_classes_export_ExportHandler $exporter */
        $exporter = new $params[self::PARAM_EXPORT_HANDLER];

        try {
            // export data under a temp directory stored locally
            $report = $exporter->export($params[self::PARAM_EXPORT_DATA], \tao_helpers_Export::getExportPath());

            if ($report instanceof Report) {
                $filePath = $report->getData();
            } else {
                $filePath = (string) $report;
                $report = $filePath
                    ? Report::createSuccess(__('Export succeeded.'))
                    : Report::createFailure(__('Export failed.'));
            }

            if ($filePath && ($newFileName = $this->storeFile($filePath))) {
                // set the new file name
                $report->setData($newFileName);
            }
        } catch (\common_exception_UserReadableException $e) {
            $report = Report::createFailure($e->getUserMessage());
        }

        return $report;
    }

    /**
     * @param array $params
     * @throws \InvalidArgumentException
     */
    private function validateParams($params)
    {
        if (!isset($params[self::PARAM_EXPORT_HANDLER])
            || !class_exists($params[self::PARAM_EXPORT_HANDLER])
            || !is_a($params[self::PARAM_EXPORT_HANDLER], \tao_models_classes_export_ExportHandler::class, true)
        ) {
            throw new \InvalidArgumentException('Please provide a valid export handler');
        }

        if (!isset($params[self::PARAM_EXPORT_DATA]) || !is_array($params[self::PARAM_EXPORT_DATA])) {
            throw new \InvalidArgumentException('Please provide the export data as array');
        }
    }

    /**
     * Copies the locally stored file under filesystem of task queue storage
     * (users will be able to download it from there)
     *
     * @param string $filePath
     * @return string
     */
    private function storeFile($filePath)
    {
        if (!file_exists($filePath)) {
            return '';
        }

        $newFileName = basename($filePath);

        /** @var Directory $queueStorage */
        $queueStorage = $this->getServiceLocator()
            ->get(FileSystemService::SERVICE_ID)
            ->getDirectory(QueueDispatcherInterface::FILE_SYSTEM_ID);

        // saving the file under the storage
        $file = $queueStorage->getFile($newFileName);
        $stream = fopen($filePath, 'r');
        $file->put($stream);
        fclose($stream);

        // delete the local file
        unlink($filePath);

        return $newFileName;
    }
}