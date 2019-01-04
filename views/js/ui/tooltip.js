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
 * Copyright (c) 2015-2018 (original work) Open Assessment Technologies SA;
 *
 */
define([
    'jquery',
    'lodash',
    'core/dataattrhandler',
    'lib/popper/popper',
    'lib/popper/tooltip',
    'tpl!ui/tooltip/default'
], function(
    $,
    _,
    DataAttrHandler,
    Popper,
    Tooltip,
    defaultTpl
){
    'use strict';

    var themes = ['dark', 'default', 'info', 'warning', 'error', 'success', 'danger'],
        themesMap = {
            'default': defaultTpl({class:'tooltip-plain'}),
            'dark': defaultTpl({class:'tooltip-dark'}),
            'error': defaultTpl({class:'tooltip-red'}),
            'success':defaultTpl({class:'tooltip-green'}),
            'info': defaultTpl({class:'tooltip-blue'}),
            'warning': defaultTpl({class:'tooltip-orange'}),
            'danger': defaultTpl({class:'tooltip-danger'})
        },
        defaultOptions = {
            template:themesMap.default,
            html:true,
            popperOptions:{
                positionFixed: true,
                placement:'auto',
                modifiers:{
                    preventOverflow:{
                        escapeWithReference:false,
                        enabled:true,
                        padding:6,
                        boundariesElement:'viewport'
                    }
                }
            }
        };

    /**
     *   Contains methods to create tooltips.
     *   Made on top of popper.js library (https://popper.js.org/tooltip-documentation.html)
     */
    return {
        /**
         * Lookup a elements that contains the data-tooltip attribute and
         * create the tooltip according to the attributes
         * @param {jQueryElement} $container - the root context to lookup inside
         */
        lookup: function lookup($container){
            var themeName;
            var setTooltip = function (el, inst) {
                if($(el).data('$tooltip')){
                    $(el).data('$tooltip').dispose();
                    $(el).removeData('$tooltip');
                }
                $(el).data('$tooltip', inst);
            };
            if($container && ($container instanceof Element || $container instanceof HTMLDocument || $container.jquery)){
                $('[data-tooltip]', $container).each(function(){
                    var $content = DataAttrHandler.getTarget('tooltip', $(this));
                    var opt;
                    themeName = _.contains(themes, $(this).data('tooltip-theme')) ? $(this).data('tooltip-theme') : 'default';
                    opt = {
                        template:themesMap[themeName]
                    };
                    if($content.length){
                        _.merge(defaultOptions, opt, { title: $content[0] });
                    }
                    setTooltip(this, new Tooltip(this, opt));
                });
            } else {
                throw new TypeError("Tooltip should be connected to DOM Element");
            }

        },
        /**
         * create new instance of tooltip (popper.js lib)
         * @param {jQueryElement|HtmlElement} el  - The DOM node used as reference of the tooltip
         * @param {String} message - text message to show inside tooltip.
         * @param {Object} options - options for tooltip. Described in (https://popper.js.org/tooltip-documentation.html#new_Tooltip_new)
         * @returns {Object} - Creates a new popper.js/Tooltip.js instance
         */
        create: function create(el, message, options){
            var calculatedOptions;
            var themeName;
            var template;

            calculatedOptions = options ? _.merge(defaultOptions, options) : defaultOptions;
            themeName = _.contains(themes, calculatedOptions.theme) ? calculatedOptions.theme : 'default';
            template = {
                template:themesMap[themeName]
            };
            if(!el && !(el instanceof Element || el instanceof HTMLDocument || el.jquery)){
                throw new Error("Tooltip should be connected to DOM Element");
            }
            if(!message && !(el instanceof Element || el instanceof HTMLDocument || el.jquery || typeof message === 'string')){
                throw new Error("Tooltip should have messsage to show");
            }
            return new Tooltip(el, _.merge(calculatedOptions, template, {title:message}));
        },
        error : function error(element, message, options){
            var theme = { theme : 'error'};
            return this.create(element, message, options ? _.merge(theme, options) : theme);
        },
        success : function success(element, message, options){
            var theme = { theme : 'success'};
            return this.create(element, message, options ? _.merge(theme, options) : theme);
        },
        info : function info(element, message, options){
            var theme = { theme : 'info'};
            return this.create(element, message, options ? _.merge(theme, options) : theme);
        },
        warning : function warning(element, message, options){
            var theme = { theme : 'warning'};
            return this.create(element, message, options ? _.merge(theme, options) : theme);
        },
        danger : function danger(element, message, options){
            var theme = { theme : 'danger'};
            return this.create(element, message, options ? _.merge(theme, options) : theme);
        }

    };
});
