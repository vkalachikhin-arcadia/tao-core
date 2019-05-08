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
 * Copyright (c) 2019 (original work) Open Assessment Technologies SA ;
 */

import itemData from './itemData';

describe('Items', () => {
    const newItemName = itemData.name;
    const modifiedItemName = `renamed ${itemData.name}`;
    const itemTreeSelector = '#tree-manage_items';
    const actionsContainer = '.tree-action-bar';
    const contentContainer = '.content-container';

    /**
     * - Set up the server & routes
     * - Log in
     * - Visit the page
     */
    before(() => {
        cy.setupServer();
        cy.addTreeRoutes();

        cy.login('admin');

        cy.fixture('urls')
            .as('urls')
            .then(urls => {
                cy.visit(`${urls.index}?structure=items&ext=taoItems`);
            });
    });

    /**
     * Destroy everything we created, leaving the environment clean for next time.
     */
    afterEach(() => {
        //TODO
    });

    describe('Item creation, edit and delete', () => {
        it('items page loads', function() {
            cy.get(itemTreeSelector);
        });

        it('can create a new item', function() {
            cy.contains('New item').click();

            cy.wait('@editResource').wait(300); // re-rendering time buffer :(

            cy.get(contentContainer).within(() => {
                cy.contains('Edit Item').should('be.visible'); // doesn't guarantee latest content :(

                cy.contains('label', 'Label')
                    .siblings('input')
                    .should('be.visible')
                    .clear()
                    .type(newItemName)
                    .should('have.value', newItemName);

                cy.contains('Save')
                    .click();
            });

            cy.wait('@editResource');

            cy.get(itemTreeSelector)
                .contains(newItemName).should.exist;
        });

        it('can rename previously created item', function() {
            cy.get(itemTreeSelector).within(() => {
                // don't continue if previous test did not create item
                cy.contains(newItemName).should.exist;
                cy.contains(newItemName).click({ force: true });
            });

            cy.wait('@editResource').wait(300); // re-rendering time buffer :(

            cy.get(contentContainer).within(() => {
                cy.contains('Edit Item').should('be.visible'); // doesn't guarantee latest content :(

                cy.contains('label', 'Label')
                    .siblings('input')
                    .should('be.visible')
                    .clear()
                    .type(modifiedItemName)
                    .should('have.value', modifiedItemName);

                cy.contains('Save')
                    .click();
            });

            cy.wait('@editResource');

            cy.get(itemTreeSelector)
                .contains(modifiedItemName).should.exist;
        });

        it('can delete previously created item', function() {
            cy.get(itemTreeSelector).within(() => {
                // don't continue if previous test did not modify item
                cy.contains(modifiedItemName).should.exist;
                cy.contains(modifiedItemName).click({ force: true });
            });

            cy.wait('@editResource').wait(300); // re-rendering time buffer :(

            cy.contains('Delete').click();
            cy.get('.modal-body [data-control="ok"]').click();

            cy.wait('@deleteItem');
        });

        it('has correct action buttons when item is selected', function() {
            // select first unselected item
            cy.get(itemTreeSelector).find('li.instance.selectable:not(.selected)').first().click({ force: true });

            cy.wait('@editResource');

            cy.get(actionsContainer).within(() => {
                Cypress._.forEach([
                    'New class',
                    'Delete',
                    'Import',
                    'Export',
                    'Duplicate',
                    'Copy To',
                    'Move To',
                    'New item'
                ], (buttonText) => {
                    cy.contains(buttonText).should('exist').and('be.visible');
                });
            });

        });

        it('has correct action buttons when nothing is selected', function() {
            // deselect selected list item
            cy.get(itemTreeSelector).find('li.instance.selected').first().click({ force: true });

            cy.get(actionsContainer).within(() => {
                Cypress._.forEach([
                    'New class',
                    'Delete',
                    'Import',
                    'Export',
                    'Duplicate',
                    'Copy To',
                    'Move To',
                    'New item'
                ], (buttonText) => {
                    cy.contains(buttonText).should('not.be.visible');
                });
            });
        });

    });
});
