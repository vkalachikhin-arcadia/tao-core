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
 *
 * Opens the media selector in a modal popup
 *
 *
 * @author Bertrand Chevrier <bertrand@taotesting.com>
 */
define([
    'jquery',
    'ui/component',
    'ui/modal',
    'ui/mediaSelector/selector',
    'tpl!ui/resource/tpl/modal',
], function($, component, modal, mediaSelectorFactory, modalTpl){
    'use strict';


    return function modalSelectorFactory($container, config){


        var modalSelector = component({}, {})
            .setTemplate(modalTpl)
            .on('init', function(){

                //this.searchQuery = {};
                //this.classUri    = this.config.classUri;
                //this.format      = this.config.format || _.findKey(this.config.formats, { active : true });
                //this.config.multiple =  this.config.selectionMode === selectionModes.multiple;

                //this.render($container || $('body'));
            })
            .on('render', function(){

                this.getElement().modal();
            });

        _.defer(function(){
            modalSelector.init(config);
        });
        return modalSelector;
    };

});
