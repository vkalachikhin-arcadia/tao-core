<div class="media-selector">
    <section class="media-browser">
        <div class="resource-selector-container"></div>
        <ul class="actions plain action-bar tree-action-bar">
        {{#if actions.upload}}
            <li class="action"><a href="#" class="li-inner" data-action="toggleUpload"><span class="glyph icon-upload"></span>{{__ 'Upload'}}</a></li>
        {{/if}}
        {{#if actions.download}}
            <li class="action"><a href="#" class="li-inner disabled" data-action="download"><span class="glyph icon-download"></span>{{__ 'Download'}}</a></li>
        {{/if}}
        {{#if actions.delete}}
            <li class="action"><a href="#" class="li-inner disabled" data-action="delete"><span class="glyph icon-bin"></span>{{__ 'Delete'}}</a></li>
        {{/if}}
        </ul>
    </section>

    <section class="media-view {{#if uploadStartOpen}}hidden{{/if}}">
        <h2>{{__ 'Preview'}}</h2>
        <div class="media-preview"></div>
        <div class="media-properties"></div>
        <div class="actions buttons">
        {{#if actions.select}}
            <button class="btn-info" data-action="select">{{__ 'Select'}}</button>
        {{/if}}
        {{#if actions.cancel}}
            <button class="btn-info" data-action="cancel">{{__ 'Cancel'}}</button>
        {{/if}}
        </div>
    </section>

    {{#if actions.upload}}
    <section class="media-upload {{#unless uploadStartOpen}}hidden{{/unless}}">
        <h2>{{__ 'Upload'}}</h2>
        <p>{{__ 'to'}} : <span class="destination"></span></p>
        <div class="media-uploader"></div>
    </section>
    {{/if}}

</div>
