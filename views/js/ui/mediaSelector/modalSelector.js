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
 * Opens the media selector in a modal popup
 * (Wraps the mediaSelector component}
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'ui/component',
    'ui/modal',
    'ui/mediaSelector/selector',
    'tpl!ui/mediaSelector/tpl/modal',
], function($, _, __, component, modal, mediaSelectorFactory, modalTpl){
    'use strict';

    var defaultConfig = {
        title : __('Media Manager'),
        instructions : false
    };

    /**
     * Creates the  modalMediaSelector
     *
     * @param {jQueryElement} $container - where to append the component
     * @param {Object} [config] - configuration options
     * @param {String}  [config.title] - the modal title
     * @param {String}  [config.instructions] - Additional instructions
     * @param {Boolean} [config.uploadDisabled = false] - to disable the upload part
     * @param {Boolean} [config.uploadStartOpen = false] - to start the component with the upload view
     * @param {String|String[]} [config.uploadFilters] - to filter medias by mime type
     * @returns {modalMediaSelector} the component
     */
    return function modalMediaSelectorFactory($container, config){

        /**
         * Defines the component
         * @typedef {modalMediaSelector}
         */
        var modalMediaSelector = component({
            open : function open(){
                if(this.is('rendered')){
                    this.getElement().modal('open');
                }
            },
            close : function close(){
                if(this.is('rendered')){
                    this.getElement().modal('close');
                }
            },

            /**
             * Forward updates to the inner selector
             * @see {ui/resource/selector#update}
             */
            //update : function update(nodes, params){
                //if(this.mediaSelector){
                    //this.mediaSelector.update(nodes, params);
                //}
            //}h
        }, defaultConfig)
            .setTemplate(modalTpl)
            .on('init', function(){

                this.render($container || $('body'));
            })
            .on('render', function(){
                var self = this;

                var $selectorContainer = this.getElement().find('.media-selector-container');

                this.mediaSelector = mediaSelectorFactory($selectorContainer, this.config)
                    .on('select', function(selection){
                        self.close();
                        self.trigger('select', selection);
                    });

                this.mediaSelector.spread(this, ['query', 'error', 'download', 'upload', 'delete']);
                this.update     = this.mediaSelector.update;
                this.removeNode = this.mediaSelector.removeNode;
                this.addNode    = this.mediaSelector.addNode;

                this.getElement()
                    .on('close.modal', function(){
                        self.trigger('close');
                    })
                    .on('opened.modal', function(){
                        self.trigger('open');
                    })
                    .modal({
                        startClosed: true,
                        minWidth : 'responsive',
                    });
            });

        _.defer(function(){
            modalMediaSelector.init(config);
        });
        return modalMediaSelector;
    };

});
