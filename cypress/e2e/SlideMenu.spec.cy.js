/// <reference types="cypress" />

const frontend = 'http://frontend:8080';

// describe('Accessibility Testing pa11y', () => {
//     it(`should be accessible`, () => {
//     cy.visit(frontend + '/demo/js-demo.html');
//     cy.pa11y(
//         {
//             hideElements: null, // f.g. '.klaro, #cookie-bot'
//             ignore: [
//                 "WCAG2AAA.Principle2.Guideline2_4.2_4_1.G1,G123,G124.NoSuchID",
//                 "WCAG2AAA.Principle1.Guideline1_1.1_1_1.H67.2",
//             ], // rules can be ignored here
//             rules: [], // extra rules can be added f.g 'Principle1.Guideline1_3.1_3_1_AAA' all options can be found here: https://squizlabs.github.io/HTML_CodeSniffer/Standards/WCAG2/
//             includeNotices: false,
//             includeWarnings: false,
//             standard: 'WCAG2AAA', // possible standards 'WCAG2A', 'WCAG2AA', 'WCAG2AAA'
//             chromeLaunchConfig: {
//                 headless: true,
//                 ignoreHTTPSErrors: true,
//                 args: ['--no-sandbox', '--disable-setuid-sandbox'],
//             }
//         }
//     ); 
//     })
// });

describe('slide menu', () => {

    it('should be reachable (run "npm run watch" in frontend container first!)', () => {
        cy.visit(frontend + '/demo/js-demo.html');
        cy.contains('Slide Menu');
        cy.get('html').then(elem => {
            document.body.style.display = 'none';
        })
        cy.get('.slide-menu').should('not.be.visible');
    });

    it('default config: should open menu per default', () => {
        cy.visit(frontend + '/demo/test-config-default.html');
        cy.get('.slide-menu').should('not.be.visible');
    });

    it('custom config: should open menu per default', () => {
        cy.visit(frontend + '/demo/js-demo.html');
        cy.get('.slide-menu').should('be.visible');
    });

    it('should close menu on button click', () => {
        cy.visit(frontend + '/demo/js-demo.html');

        cy.get('[data-cypress="close-menu"]').click();
        cy.get('.slide-menu').should('not.be.visible');
    });

    it('should toggle menu on button click', () => {
        cy.visit(frontend + '/demo/js-demo.html');

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
        cy.visit(frontend + '/demo/js-demo.html');

        cy.get('[data-cypress="close-menu"]').should('be.visible').click();
        cy.get('.slide-menu').should('not.be.visible');

        cy.get('[data-cypress="open-menu"]').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');
    });

    it('should navigate back on button click', () => {
        cy.visit(frontend + '/demo/js-demo.html');

        cy.get('.slide-menu').should('be.visible');
        cy.get('.slide-menu__foldable__wrapper').should('be.visible');
        cy.get('[data-cypress="back-manually-inserted-backlink"]').should('be.visible');

        cy.get('[data-cypress="back-close-fold"]').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');
        cy.get('.slide-menu__foldable__wrapper').should('not.be.visible');
        cy.get('[data-cypress="back-manually-inserted-backlink"]').should('not.be.visible');
    });

    it('custom config: should navigate on clicking link navigators', () => {
        cy.visit(frontend + '/demo/js-demo.html');

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

        // go forward by navigator
        cy.get('[data-cypress="jump-to-news"] + .slide-menu__navigator').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');
        cy.get('.slide-menu__foldable__wrapper').should('not.be.visible');
        cy.get('[data-cypress="back-manually-inserted-backlink"]').should('be.visible');

        cy.wait(500)

        // go forward by navigator
        cy.get('[data-cypress="jump-to-news-1-2"] + .slide-menu__navigator').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');
        cy.get('.slide-menu__foldable__wrapper').should('be.visible');
        cy.get('[data-cypress="back-manually-inserted-backlink"]').should('be.visible');
    });

    it('custom config: should not go forward on clicking link', () => {
        cy.visit(frontend + '/demo/js-demo.html');

        // go back
        cy.get('[data-cypress="back-close-fold"]').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');
        cy.get('.slide-menu__foldable__wrapper').should('not.be.visible');
        cy.get('[data-cypress="back-manually-inserted-backlink"]').should('not.be.visible');

        cy.wait(500)

        // should not go forward without navigator
        cy.get('[data-cypress="jump-to-news"]').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');
        cy.get('.slide-menu__foldable__wrapper').should('not.be.visible');
        cy.get('[data-cypress="back-manually-inserted-backlink"]').should('not.be.visible');
    });

    it('default config: should not go forward on clicking link', () => {
        cy.visit(frontend + '/demo/test-config-default.html');

        // open menu
        cy.get('[data-cypress="open-menu"]').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');

        // go back
        cy.get('[data-cypress="back-close-fold"]').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');
        cy.get('.slide-menu__foldable__wrapper').should('not.be.visible');
        cy.get('[data-cypress="back-manually-inserted-backlink"]').should('not.be.visible');

        cy.wait(500)

        // should go forward without navigator
        cy.get('[data-cypress="jump-to-news"]').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');
        cy.get('[data-cypress="back-manually-inserted-backlink"]').should('be.visible');
        cy.get('.slide-menu__foldable__wrapper').should('not.be.visible');

        cy.wait(500)

        // should go forward without navigator
        cy.get('[data-cypress="jump-to-news-1-2"]').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');
        cy.get('[data-cypress="back-manually-inserted-backlink"]').should('be.visible');
        cy.get('.slide-menu__foldable__wrapper').should('be.visible');
    });

    it('should switch foldable content on click', () => {
        cy.visit(frontend + '/demo/test-config-default.html');

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
        cy.visit(frontend + '/demo/test-config-default.html');

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

    it('should navigate to first fold level', () => {
        cy.visit(frontend + '/demo/test-config-default.html');

        // open specific menu
        cy.get('[data-cypress="open-news-1-2-2"]').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');
        cy.get('.slide-menu__foldable__wrapper').should('be.visible');
        cy.get('[data-cypress="news-1-2-2"]').should('be.visible');
        cy.get('[data-cypress="third-level"]').should('not.be.visible');
    });

    it('should navigate to second fold level', () => {
        cy.visit(frontend + '/demo/test-config-default.html');

        // open specific menu
        cy.get('[data-cypress="open-news-1-2-3-1"]').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');
        cy.get('.slide-menu__foldable__wrapper').should('be.visible');
        cy.get('[data-cypress="third-level"]').should('be.visible');
        cy.get('[data-cypress="news-1-2-3-1"]').should('be.visible');
    });

    it('should navigate to first fold level after second slide', () => {
        cy.visit(frontend + '/demo/test-config-default.html');

        // open specific menu
        cy.get('[data-cypress="open-about-1-4-4"]').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');
        cy.get('.slide-menu__foldable__wrapper').should('be.visible');
        cy.get('[data-cypress="about-first-foldable-submenu"]').should('be.visible');
        cy.get('[data-cypress="about-1-4-4"]').should('be.visible');
    });

    // check if trapping focus is working on foldable
    it('should trap focus inside menu with foldable', () => {
        cy.visit(frontend + '/demo/test-config-default.html');

        cy.realPress("Tab"); 

        cy.focused()
            .should('exist')
            .closest('.slide-menu')
            .should('not.exist') 

        // open menu
        cy.get('[data-cypress="open-menu"]').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');
        cy.get('.slide-menu__foldable__wrapper').should('be.visible');

        cy.wait(500)

        // cycle through all menu items multiple times
        for (let i = 0; i < 75; i++) {
            cy.realPress("Tab");
    
            cy.wait(100)
    
            cy.focused()
                .should('exist')
                .closest('.slide-menu')
                .should('exist')
        }

        cy.get('[data-cypress="close-menu-control"]').click();

        cy.wait(500);

        cy.focused()
            .should('exist')
            .closest('.slide-menu')
            .should('not.exist')

        cy.realPress("Tab");

        cy.focused()
            .should('exist')
            .closest('.slide-menu')
            .should('not.exist') 
    });

    // check if trapping focus is working on slides
    it('should trap focus inside menu with slides', () => {
        cy.visit(frontend + '/demo/test-config-default.html');

        cy.realPress("Tab"); 

        cy.focused()
            .should('exist')
            .closest('.slide-menu')
            .should('not.exist') 

        // open menu
        cy.get('[data-cypress="jump-to-about"]').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');
        cy.get('.slide-menu__foldable__wrapper').should('not.be.visible');

        cy.wait(500)

        // cycle through all menu items multiple times
        for (let i = 0; i < 75; i++) {
            cy.realPress("Tab");
    
            cy.wait(100)
    
            cy.focused()
                .should('exist')
                .closest('.slide-menu')
                .should('exist')
        }

        cy.get('[data-cypress="close-menu-control"]').click();

        cy.wait(500);

        cy.focused()
            .should('exist')
            .closest('.slide-menu')
            .should('not.exist')

        cy.realPress("Tab");

        cy.focused()
            .should('exist')
            .closest('.slide-menu')
            .should('not.exist') 
    });

    // check tabbing not possible if menu is closed
    it.only('should not be tabable when closed', () => {
        cy.visit(frontend + '/demo/test-config-default.html');

        cy.wait(500);

        cy.get('.slide-menu').should('not.be.visible');
        cy.get('button').first().focus().should('be.visible').should('be.focused');

        cy.realPress("Tab");
        cy.wait(100);
        cy.focused()
            .should('exist')
            .closest('.slide-menu')
            .should('not.exist') 

        // cy.get('[data-cypress="jump-to-about"]').should('be.visible').focus();

        // check that is not tabbable when closed
        for (let i = 0; i < 30; i++) {
            cy.realPress("Tab");
            cy.wait(100)

            cy.get('[data-cypress="back-close-fold"]').should('exist').should('not.be.focused')
            cy.get('[data-cypress="close-menu-control"]').should('exist').should('not.be.focused')
            cy.get('[data-cypress="jump-to-news"]').should('exist').should('not.be.focused')
        }

        // open menu & check that focus is trapped correctly
        cy.get('[data-cypress="jump-to-about"]').should('be.visible').click();
        cy.get('.slide-menu').should('be.visible');
        cy.wait(500);
        // cycle through all menu items multiple times
        for (let i = 0; i < 30; i++) {
            cy.realPress("Tab");
    
            cy.wait(100)
    
            cy.focused()
                .should('exist')
                .closest('.slide-menu')
                .should('exist')
        }
        
        cy.get('[data-cypress="close-menu-control"]').click();
        cy.wait(500);
        // check that is still not tabbable after opening & closing
        for (let i = 0; i < 30; i++) {
            cy.realPress("Tab");
            cy.wait(100)
            
            cy.get('[data-cypress="back-close-fold"]').should('exist').should('not.be.focused')
            cy.get('[data-cypress="close-menu-control"]').should('exist').should('not.be.focused')
            cy.get('[data-cypress="jump-to-news"]').should('exist').should('not.be.focused')
        }
    });

    // TODO: check if fold is not opening on mobile dimensions
    // TODO: tabbing & focus Trapping on resizing window
    // TODO: check if default-open-target is working when it is in 1st menu level and you first navigate to root and then open menu again through default-open-target
});
