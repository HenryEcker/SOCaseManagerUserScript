import {fetchFromAWS} from './AWSAPI';
import {startAuthFlow} from './ClientSideAuthFlow';
import {accessToken} from './gmAPI';
import {buildAnswerControlPanel} from './Scripts/AnswerControlPanel';
import {CaseManagerControlPanel} from './Scripts/CaseManagerControlPanel';
import {CasesUserList} from './Scripts/CasesList';
import {buildAnswerSummaryIndicator} from './Scripts/ProfileAnswerSummaryIndicator';
import {buildUserScriptSettingsPanel} from './Scripts/UserScriptSettings';
import {type StackExchangeAPI} from './SEAPI';
import {buildAlertSvg} from './SVGBuilders';

declare const StackExchange: StackExchangeAPI;

function buildPlagiaristTab() {
    const primaryUsersNav = $('.js-filter-btn');
    const a = $(`<a class="js-sort-preference-change flex--item s-btn s-btn__muted s-btn__outlined" href="/users${tabIdentifiers.cases}" data-nav-xhref="" title="Users who have been or are currently under investigation" data-value="plagiarist" data-shortcut="">Plagiarists</a>`);
    primaryUsersNav.append(a);
    if (window.location.search.startsWith(tabIdentifiers.cases)) {
        new CasesUserList().init();
    }
}

function buildCurrentUserProfilePage() {
    const navButton = $(`<a href="${window.location.pathname}${tabIdentifiers.settings}" class="s-navigation--item">Case Manager Settings</a>`);
    const tabContainer = $('.user-show-new .s-navigation:eq(0)');
    tabContainer.append(navButton);
    if (window.location.search.startsWith(tabIdentifiers.settings)) {
        const mainPanel = $('#mainbar-full');
        mainPanel.empty(); // Empty before request (to indicate immediately indicate the page will render)
        mainPanel.append(buildUserScriptSettingsPanel());
    }
}


function getUserIdFromWindowLocation() {
    const patternMatcher = window.location.pathname.match(/^\/users\/\d+/g) || window.location.pathname.match(/^\/users\/account-info\/\d+/g);
    if (patternMatcher === null || patternMatcher.length !== 1) {
        throw Error('Something changed in user path!');
    }
    return Number(patternMatcher[0].split('/').at(-1));
}

function buildProfileNavPill(userId: number) {
    const navButton = $(`<a href="${window.location.pathname}${tabIdentifiers.userSummary}" class="s-navigation--item">Case Manager</a>`);
    void fetchFromAWS(`/case/user/${userId}`)
        .then(res => res.json())
        .then((resData: { is_known_user: boolean; }) => {
            if (resData['is_known_user']) {
                navButton.prepend(buildAlertSvg(16, 20));
            }
        });

    const tabContainer = $('.user-show-new .s-navigation:eq(0)');
    tabContainer.append(navButton);
    return {
        tabContainer,
        navButton
    };
}

function buildProfilePage() {
    const userId = getUserIdFromWindowLocation();
    const {tabContainer, navButton} = buildProfileNavPill(userId);

    if (window.location.search.startsWith(tabIdentifiers.userSummary)) {
        const selectedClass = 'is-selected';
        // Make nav the only active class
        tabContainer.find('a').removeClass(selectedClass);
        navButton.addClass(selectedClass);
        /***
         * Mods default to ?tab=activity while everyone else defaults to ?tab=profile
         * That is why the selector is the last div in #mainbar-full instead of #main-content
         */
        // Blank the content to make room for the UserScript
        $('#mainbar-full > div:last-child').replaceWith(new CaseManagerControlPanel(userId).init());
    } else if (window.location.search.startsWith(tabIdentifiers.userAnswers)) {
        buildAnswerSummaryIndicator();
    }
}

function UserScript() {
    // API TOKEN IS REQUIRED
    if (GM_getValue(accessToken, null) === null) {
        startAuthFlow();
        return; // Nothing else is allowed to run without valid auth
    }

    if (window.location.pathname.match(/^\/questions\/.*/) !== null) {
        buildAnswerControlPanel();
    } else if (window.location.pathname.match(/^\/users$/) !== null) {
        buildPlagiaristTab();
    } else if (window.location.pathname.match(new RegExp(`^/users/${StackExchange.options.user.userId}.*`)) !== null) {
        buildCurrentUserProfilePage();
    } else if (window.location.pathname.match(/^\/users\/.*/) !== null) {
        buildProfilePage();
    }
}

StackExchange.ready(() => {
    UserScript();
});