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
 * Copyright (c) 2017 (original work) Open Assessment Technologies SA ;
 */

namespace oat\tao\model\security\xsrf;

/**
 * Tokens' pool storage
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
interface TokenStore
{
    const TOKEN_KEY = 'XSRF_TOKEN';
    const TOKEN_NAME = 'XSRF_TOKEN_NAME';
    /**
     * Retrieve the pool of tokens
     * @return Token[]
     */
    public function getTokens();

    /**
     * Set the pool of tokens
     * @param Token[]
     */
    public function setTokens(array $tokens = []);

    /**
     * Remove all tokens
     */
    public function removeTokens();
}
