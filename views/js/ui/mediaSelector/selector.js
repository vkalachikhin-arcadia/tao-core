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
 * Media selector component, let's you
 *  - browse and search media
 *  - upload media
 *  - preview a media
 *  - delete a media
 *
 * The component handles only the UI, no data.
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'lodash',
    'i18n',
    'core/areaBroker',
    'ui/component',
    'ui/hider',
    'ui/resource/selector',
    'ui/dialog/confirm',
    'tpl!ui/mediaSelector/tpl/selector',
    'tpl!ui/mediaSelector/tpl/properties',
    'css!ui/mediaSelector/css/selector.css',
    'ui/previewer',
    'ui/uploader',
], function($, _, __, areaBroker, component, hider, resourceSelectorFactory, confirmDialog, selectorTpl, propertiesTpl){
    'use strict';

    var defaultConfig = {
        uploadDisabled : false,
        uploadStartOpen : false,
        uploadFilters : []
    };

    /**
     * Creates the mediaSelector
     *
     * @param {jQueryElement} $container - where to append the component
     * @param {Object} [config] - configuration options
     * @param {Boolean} [config.uploadDisabled = false] - to disable the upload part
     * @param {Boolean} [config.uploadStartOpen = false] - to start the component with the upload view
     * @param {String|String[]} [config.uploadFilters] - to filter medias by mime type
     * @returns {mediaSelector} the component
     */
    return function mediaSelectorFactory($container, config){

        /**
         * The selected media
         * @type {Object}
         */
        var media = null;

        /**
         * The inner component areas
         * @type {coreareaBroker}
         */
        var areas;

        /**
         * Defines the mediaSelector component
         * @typedef {mediaSelector}
         */
        var mediaSelector = component({

            /**
             * Get the selected media
             * @returns {Object} the media
             */
            getSelectedMedia : function getSelectedMedia(){
                return media;
            },

            /**
             *
             */
            selectMedia : function selectMedia(selected){

                if(_.isPlainObject(selected)){
                    media = selected;

                    if(media && this.is('rendered')){

                        $('.action a',  areas.getArea('actions')).removeClass('disabled');

                        this.togglePreview();

                        areas.getArea('preview').previewer('update', {
                            url : media.url,
                            mime : media.mime,
                            name : media.label
                        });

                        areas.getArea('properties').html(propertiesTpl(media));
                    }
                }
                return this;
            },

            unSelectMedia : function unSelectMedia(){
                media = null;

                if(this.is('rendered')){
                    $('.action a:not([data-action="toggleUpload"])',  areas.getArea('actions')).addClass('disabled');
                }
            },

            deleteMedia : function deleteMedia(){
                var self = this;
                if(media && media.label){
                    confirmDialog(__('Are you sure you want to remove %s ?', media.label), function accept(){
                        self.trigger('delete', media);
                    });
                }
                return this;
            },

            downloadMedia : function downloadMedia(){
                if(media){
                    self.trigger('download', media);
                }
                return this;
            },


            select : function select(){
                this.trigger('select', media);
            },

            /**
             * Switch on the upload panel
             * @returns {mediaSelector} chains
             */
            toggleUpload : function toggleUpload(){
                if (!this.config.uploadDisabled && this.is('rendered') && !this.is('upload')) {
                    hider.hide(areas.getArea('view'));
                    hider.show(areas.getArea('upload'));
                    this.setState('preview', false);
                    this.setState('upload', true);
                }
                return this;
            },

            /**
             * Switch on the preview panel
             * @returns {mediaSelector} chains
             */
            togglePreview : function togglePreview(){
                if (this.is('rendered') && !this.is('preview')) {
                    hider.hide(areas.getArea('upload'));
                    hider.show(areas.getArea('view'));
                    this.setState('upload', false);
                    this.setState('preview', true);
                }
                return this;
            },



            /**
             * Forward updates to the inner resource selector
             * @see {ui/resource/selector#update}
             */
            //update: function update(nodes, params){
                //if(this.resourceSelector){
                    //this.resourceSelector.update(nodes, params);
                //}
            //},

            //removeNode : function removeNode(node) {
                //if(this.resourceSelector){
                    //this.resourceSelector.removeNode(node);
                //}
            //}

        }, defaultConfig)
        .setTemplate(selectorTpl)
        .on('init', function(){

            this.setState('preview', !this.config.startUploading);
            this.setState('upload', this.config.startUploading);

            this.render($container);
        })
        .on('render', function(){
            var self = this;

            var $component = this.getElement();

            //the component is big enough to setup an areaBroker
            areas = areaBroker([], $component, {
                'selector'   : $('.resource-selector-container', $component),
                'actions'    : $('.actions', $component),
                'view'       : $('.media-view', $component),
                'preview'    : $('.media-preview', $component),
                'properties' : $('.media-properties', $component),
                'upload'     : $('.media-upload', $component),
                'uploader'   : $('.media-uploader', $component)
            });

            // initialize a resource selector
            this.resourceSelector =  resourceSelectorFactory(areas.getArea('selector'), {
                classes : this.config.classes,
                classUri : this.config.classUri,
                selectionMode : resourceSelectorFactory.single,
                icon : 'media'
            })
            .on('classchange', function(classUri, classNode){
                if(!self.config.uploadDisabled){

                    areas.getArea('upload').find('.destination').text(classNode.label);
                }
            })
            .on('change', function(selection){
                if(_.size(selection) > 0){
                    self.selectMedia(_.values(selection)[0]);
                } else {
                    self.unSelectMedia();
                }
            });

            //forward some events and method between the embed resourceSelector and the mediaSelector
            //in order to externalize the data management
            this.resourceSelector.spread(this, ['error', 'query']);
            this.update     = this.resourceSelector.update;
            this.removeNode = this.resourceSelector.removeNode;
            this.addNode    = this.resourceSelector.addNode;


            //set up the uploader
            if(!this.config.uploadDisabled){
                areas.getArea('uploader').uploader({
                    upload      : true,
                    multiple    : true,
                    fileSelect  : function(files, done){

                        done(files);
                    }
                });
            }

            //set up the previewer
            areas.getArea('preview').previewer({ url : ''});

            //bind component's actions to the component API
            areas.getArea('actions').on('click', '[data-action]', function(e){
                var $actionElt;
                var action;
                e.preventDefault();

                $actionElt = $(this);

                if(!$actionElt.hasClass('disabled')){
                    action = $actionElt.data('action');

                    if(_.isFunction(self[action])){
                        self[action]();
                    }
                }
            });
        });

        _.defer(function(){
            mediaSelector.init(config);
        });
        return mediaSelector;
    };
});
