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

/**
 * A switch component, toggles between on and off
 *
 * @example
 * switchFactory(container, config)
 *     .on('change', function(value){
 *              console.log('The light is ' + value);
 *     });
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'ui/component',
    'ui/resource/selector',
    'tpl!ui/mediaSelector/tpl/selector',
    'ui/previewer',
    'css!ui/mediaSelector/css/selector.css'
], function($, _, __, component, resourceSelectorFactory, switchTpl, previewer){
    'use strict';

    var states = {
    };

    var defaultConfig = {
    };

    /**
     * The factory that creates a switch component
     *
     * @param {jQueryElement} $container - where to append the component
     * @returns {switchComponent} the component
     */
    return function switchFactory($container, config){

        /**
         * The component API
         */
        var api = {

        };

        var switchComponent = component(api, defaultConfig)
            .setTemplate(switchTpl)
            .on('init', function(){


                this.render($container);
            })
            .on('render', function(){
                var self = this;

                var $component = this.getElement();

                resourceSelectorFactory($component.find('.resource-selector-container'), {
                    classes : [{
                        uri : '0',
                        label : 'Local'
                    }, {
                        uri : '1',
                        label : 'Shared'
                    }],
                    multiple : false
                })

                $component.find('.media-preview').previewer({ url : '/tao/views/img/tao-logo.png', type : 'image' });

            });

        _.defer(function(){
            switchComponent.init(config);
        });
        return switchComponent;
    };
});
