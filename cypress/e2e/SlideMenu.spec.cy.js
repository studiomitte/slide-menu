/// <reference types="cypress" />

describe('slide menu', () => {

    const frontend = 'http://frontend:8080';

    it('should be reachable (run "npm run watch" in frontend container first!)', () => {
        cy.visit(frontend);
        cy.contains('Slide Menu');
        cy.get('html').then(elem => {
            document.body.style.display = 'none';
        })
        cy.get('.slide-menu').should('not.be.visible');
    });

    it('default config: should open menu per default', () => {
        cy.visit(frontend + '/config-default.html');
        cy.get('.slide-menu').should('not.be.visible');
    });

    it('custom config: should open menu per default', () => {
        cy.visit(frontend);
        cy.get('.slide-menu').should('be.visible');
    });

    it('should close menu on button click', () => {
        cy.visit(frontend);

        cy.get('[data-cypress="close-menu"]').click();
        cy.get('.slide-menu').should('not.be.visible');
    });

    it('should toggle menu on button click', () => {
        cy.visit(frontend);

        cy.get('[data-cypress="close-menu"]').click();

        cy.wait(500);
        
        cy.get('.slide-menu').should('not.be.visible');
        cy.get('[data-cypress="toggle-menu"]').click();

        cy.wait(500);

        cy.get('.slide-menu').should('be.visible');
        cy.get('[data-cypress="back-manually-inserted-backlink"]').should('be.visible').click();
        cy.get('[data-cypress="close-menu"]').click();

        cy.wait(500);
        
        cy.get('.slide-menu').should('not.be.visible');
        cy.get('[data-cypress="toggle-menu"]').click();

        cy.wait(500);
        cy.get('.slide-menu').should('be.visible');
    });

    it('should open menu on button click', () => {
        cy.visit(frontend);

        cy.get('[data-cypress="close-menu"]').should('be.visible').click();
        cy.get('.slide-menu').should('not.be.visible');

        cy.get('[data-cypress="open-menu"]').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');
    });

    it('should navigate back on button click', () => {
        cy.visit(frontend);

        cy.get('.slide-menu').should('be.visible');
        cy.get('.slide-menu__foldable__wrapper').should('be.visible');
        cy.get('[data-cypress="back-manually-inserted-backlink"]').should('be.visible');

        cy.get('[data-cypress="back-close-fold"]').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');
        cy.get('.slide-menu__foldable__wrapper').should('not.be.visible');
        cy.get('[data-cypress="back-manually-inserted-backlink"]').should('not.be.visible');
    });

    it('custom config: should navigate on clicking link decorators', () => {
        cy.visit(frontend);

        // is open
        cy.get('.slide-menu').should('be.visible');
        cy.get('.slide-menu__foldable__wrapper').should('be.visible');
        cy.get('[data-cypress="back-manually-inserted-backlink"]').should('be.visible');

        cy.wait(500)

        // go back
        cy.get('[data-cypress="back-close-fold"]').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');
        cy.get('.slide-menu__foldable__wrapper').should('not.be.visible');
        cy.get('[data-cypress="back-manually-inserted-backlink"]').should('not.be.visible');

        cy.wait(500)

        // go forward by decorator
        cy.get('[data-cypress="jump-to-news"] .slide-menu__decorator').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');
        cy.get('.slide-menu__foldable__wrapper').should('not.be.visible');
        cy.get('[data-cypress="back-manually-inserted-backlink"]').should('be.visible');

        cy.wait(500)

        // go forward by decorator
        cy.get('[data-cypress="jump-to-news-1-2"] .slide-menu__decorator').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');
        cy.get('.slide-menu__foldable__wrapper').should('be.visible');
        cy.get('[data-cypress="back-manually-inserted-backlink"]').should('be.visible');
    });

    it('custom config: should not go forward on clicking link', () => {
        cy.visit(frontend);

        // go back
        cy.get('[data-cypress="back-close-fold"]').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');
        cy.get('.slide-menu__foldable__wrapper').should('not.be.visible');
        cy.get('[data-cypress="back-manually-inserted-backlink"]').should('not.be.visible');

        cy.wait(500)

        // should not go forward without decorator
        cy.get('[data-cypress="jump-to-news"]').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');
        cy.get('.slide-menu__foldable__wrapper').should('not.be.visible');
        cy.get('[data-cypress="back-manually-inserted-backlink"]').should('not.be.visible');
    });

    it('default config: should not go forward on clicking link', () => {
        cy.visit(frontend + '/config-default.html');

        // open menu
        cy.get('[data-cypress="open-menu"]').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');

        // go back
        cy.get('[data-cypress="back-close-fold"]').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');
        cy.get('.slide-menu__foldable__wrapper').should('not.be.visible');
        cy.get('[data-cypress="back-manually-inserted-backlink"]').should('not.be.visible');

        cy.wait(500)

        // should go forward without decorator
        cy.get('[data-cypress="jump-to-news"]').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');
        cy.get('[data-cypress="back-manually-inserted-backlink"]').should('be.visible');
        cy.get('.slide-menu__foldable__wrapper').should('not.be.visible');

        cy.wait(500)

        // should go forward without decorator
        cy.get('[data-cypress="jump-to-news-1-2"]').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');
        cy.get('[data-cypress="back-manually-inserted-backlink"]').should('be.visible');
        cy.get('.slide-menu__foldable__wrapper').should('be.visible');
    });

    it('should switch foldable content on click', () => {
        cy.visit(frontend + '/config-default.html');

        // open menu
        cy.get('[data-cypress="open-menu"]').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');
        
        cy.wait(500)
        
        cy.get('.slide-menu__foldable__wrapper').should('be.visible');
        cy.contains('News 1.2.3.5').should('be.visible');
        cy.contains('News 1.2.4.5').should('not.be.visible');

        cy.wait(500)

        // navigate to show 1.2.4.5
        cy.contains('News 1.2.4').should('be.visible').click();
        cy.contains('News 1.2.3.5').should('not.be.visible');
        cy.contains('News 1.2.4').should('be.visible');
        cy.contains('News 1.2.4.5').should('be.visible');

        cy.wait(500)

        // navigate to show 1.2.3.5
        cy.contains('News 1.2.3').should('be.visible').click();
        cy.contains('News 1.2.3.5').should('be.visible');
        cy.contains('News 1.2.4.5').should('not.be.visible');

        cy.wait(500)

        // close fold to show 1
        cy.get('[data-cypress="back-close-fold"]').should('be.visible').click();
        cy.contains('News 1.2.3.5').should('not.be.visible');
        cy.contains('News 1.2.4.5').should('not.be.visible');
        cy.get('.slide-menu__foldable__wrapper').should('not.be.visible');

        cy.wait(500)

        // navigate to show 1.2
        cy.get('[data-cypress="jump-to-news"]').should('be.visible').click();
        cy.get('.slide-menu__foldable__wrapper').should('not.be.visible');

        cy.wait(500)

        // open fold to show 1.2.3
        cy.get('[data-cypress="jump-to-news-1-2"]').should('be.visible').click();
        cy.get('.slide-menu__foldable__wrapper').should('be.visible');

        cy.wait(500)

        // navigate to show 1.2.4.5
        cy.contains('News 1.2.4').should('be.visible').click();
        cy.contains('News 1.2.3.5').should('not.be.visible');
        cy.contains('News 1.2.4').should('be.visible');
        cy.contains('News 1.2.4.5').should('be.visible');

        cy.wait(500)

        // navigate to show 1.2.3.5
        cy.contains('News 1.2.3').should('be.visible').click();
        cy.contains('News 1.2.3.5').should('be.visible');
        cy.contains('News 1.2.4.5').should('not.be.visible');

        cy.wait(500)

        // close fold to show 1
        cy.get('[data-cypress="back-close-fold"]').should('be.visible').click();
        cy.get('.slide-menu__foldable__wrapper').should('not.be.visible');

        cy.wait(500)

        // navigate to show 1.2
        cy.get('[data-cypress="jump-to-news"]').should('be.visible').click();
        cy.get('.slide-menu__foldable__wrapper').should('not.be.visible');

        cy.wait(500)

        // open fold to show 1.2.3
        cy.get('[data-cypress="jump-to-news-1-2"]').should('be.visible').click();
        cy.get('.slide-menu__foldable__wrapper').should('be.visible');

        cy.wait(500)

        // navigate to show 1.2.4.5
        cy.contains('News 1.2.4').should('be.visible').click();
        cy.contains('News 1.2.3.5').should('not.be.visible');
        cy.contains('News 1.2.4').should('be.visible');
        cy.contains('News 1.2.4.5').should('be.visible');

        cy.wait(500)

        // navigate to show 1.2.3.5
        cy.contains('News 1.2.3').should('be.visible').click();
        cy.contains('News 1.2.3.5').should('be.visible');
        cy.contains('News 1.2.4.5').should('not.be.visible');

        cy.wait(500)

        // navigate to show 1.2.4.5
        cy.contains('News 1.2.4').should('be.visible').click();
        cy.contains('News 1.2.3.5').should('not.be.visible');
        cy.contains('News 1.2.4.5').should('be.visible');

        cy.wait(500)

        // navigate to show 1.2.3.5
        cy.contains('News 1.2.3').should('be.visible').click();
        cy.contains('News 1.2.3.5').should('be.visible');
        cy.contains('News 1.2.4.5').should('not.be.visible');
    });

    it('should slide without fold', () => {
        cy.visit(frontend + '/config-default.html');

        // open menu
        cy.get('[data-cypress="open-menu"]').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');
        cy.get('.slide-menu__foldable__wrapper').should('be.visible');

        cy.wait(500)

        // close fold
        cy.get('[data-cypress="back-close-fold"]').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');
        cy.get('.slide-menu__foldable__wrapper').should('not.be.visible');

        cy.wait(500)

        // navigate About 1
        cy.get('[data-cypress="jump-to-about-1-1"]').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');
        cy.get('.slide-menu__foldable__wrapper').should('not.be.visible');
        cy.get('[data-cypress="jump-to-about-1-1"]').should('not.be.visible');

        cy.wait(500)

        // navigate About 1.1
        cy.get('[data-cypress="jump-to-about-1-2"]').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');
        cy.get('.slide-menu__foldable__wrapper').should('not.be.visible');
        cy.get('[data-cypress="jump-to-about-1-2"]').should('not.be.visible');

        cy.wait(500)

        // navigate back
        cy.get('[data-cypress="back-close-fold"]').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');
        cy.get('[data-cypress="jump-to-about-1-2"]').should('be.visible');

        cy.wait(500)

        // navigate back
        cy.get('[data-cypress="back-close-fold"]').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');
        cy.get('[data-cypress="jump-to-about-1-1"]').should('be.visible');
        cy.get('[data-cypress="jump-to-about-1-2"]').should('not.be.visible');

        cy.wait(500)

        // navigate About 1
        cy.get('[data-cypress="jump-to-about-1-1"]').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');
        cy.get('.slide-menu__foldable__wrapper').should('not.be.visible');
        cy.get('[data-cypress="jump-to-about-1-1"]').should('not.be.visible');

        cy.wait(500)

        // navigate About 1.1
        cy.get('[data-cypress="jump-to-about-1-2"]').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');
        cy.get('.slide-menu__foldable__wrapper').should('not.be.visible');
        cy.get('[data-cypress="jump-to-about-1-2"]').should('not.be.visible');
    });

    // TODO: check if trapping focus is working on foldable
    // TODO: check if trapping focus is working slides wihtout fold
    // TODO: check if default-open-target is working when it is in 1st menu level and you first navigate to root and then open menu again through default-open-target
});