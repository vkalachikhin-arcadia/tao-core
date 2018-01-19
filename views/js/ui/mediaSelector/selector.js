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
 * Copyright (c) 2018 (original work) Open Assessment Technologies SA ;
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

    /**
     * Component's default options
     * @see {mediaSelectorFactory#config}
     */
    var defaultConfig = {
        uploadStartOpen : false,
        uploadFilters : [],
        actions : {
            upload    : true,
            download  : true,
            'delete'  : true,
            select    : true,
            cancel    : true
        }
    };

    /**
     * Creates the mediaSelector
     *
     * @param {jQueryElement} $container - where to append the component
     * @param {Object} [config] - configuration options
     * @param {Boolean} [config.uploadStartOpen = false] - to start the component with the upload view
     * @param {String|String[]} [config.uploadFilters] - to filter medias by mime type
     * @param {Object} [config.actions] - the list of active actions
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
             * Get the current selected media
             * @returns {Object} the media
             */
            getSelected: function getSelected(){
                return media;
            },

            setSelected : function setSelected(selected){
                if(_.isPlainObject(selected) || selected === null){
                    media = selected;
                }
            },

            unsetSelected : function unsetSelected(){
                this.setSelectedMedia(null);
            },

            /**
             * Select
             */
            preview : function preview(){

                if(this.is('rendered')){

                    if(media){
                        $('.action a',  areas.getArea('actions')).removeClass('disabled');

                        this.togglePreview();

                        areas.getArea('preview').previewer('update', {
                            url : media.url,
                            mime : media.mime,
                            name : media.label
                        });

                        areas.getArea('properties').html(propertiesTpl(media));
                    } else {
                        $('.action a:not([data-action="toggleUpload"])',  areas.getArea('actions')).addClass('disabled');
                    }
                }
                return this;
            },

            //delete : function delete(){
                //var self = this;
                //if(this.config.actions.delete && media && media.label){
                    //this.disable();
                    //confirmDialog(
                        //__('Are you sure you want to remove %s ?', media.label),
                        //function accept(){
                            //self.trigger('delete', media);
                            //self.enable();
                        //}, function reject(){
                            //self.enable();
                        //}
                    //);
                //}
                //return this;
            //},

            //downloadMedia : function downloadMedia(){
                //if(this.config.actions.download && media){
                    //this.trigger('download', media);
                //}
                //return this;
            //},

            //select : function select(){
                //if(this.actions.select){
                    //this.trigger('select', media);
                //}
            //},

            //cancel : function cancel(){
                //if(this.config.actions.cancel){
                    //this.trigger('cancel');
                //}
            //},

            /**
             * Switch on the upload panel
             * @returns {mediaSelector} chains
             */
            toggleUpload : function toggleUpload(){
                if (this.config.actions.upload && this.is('rendered') && !this.is('upload')) {
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
            update: function update(nodes, params){
                if(this.resourceSelector){
                    this.resourceSelector.update(nodes, params);
                }
            },

            getResourceSelector : function getResourceSelector() {
                return this.resourceSelector;
            }

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
                    self.setSelected(_.values(selection)[0]);
                } else {
                    self.unsetSelected();
                }
                self.preview();
            });

            this.resourceSelector.spread(this, ['error', 'query']);

            //set up the uploader
            if(this.config.actions.upload){
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

                    if(self.config.actions[action]){
                        if(_.isFunction(self[action])){
                            self[action]( self.getSelected());
                        }
                        self.trigger(action, self.getSelected());
                    }
                }
            });
        })
        .before('delete', function(){
            var self = this;
            this.disable();
            return new Promise(function(resolve, reject){
                if(self.config.actions.delete && media && media.label){

                    confirmDialog(
                        __('Are you sure you want to remove %s ?', media.label),
                        function confirm(){
                            self.enable();
                            resolve();

                        }, function cancel(){
                            self.enable();
                            reject();
                        }
                    );
                } else {
                    return reject();
                }
            });
        });

        _.defer(function(){
            mediaSelector.init(config);
        });
        return mediaSelector;
    };
});
