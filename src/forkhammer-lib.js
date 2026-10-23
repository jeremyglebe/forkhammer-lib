// Modified for Forkhammer Lib from Warhammer Library 3.5.1.
/* eslint-disable no-undef */
import "../styles/forkhammer.scss";
import WarhammerScript from "./system/script";
import ItemDialog from "./apps/item-dialog";
import ValueDialog from "./apps/value-dialog";
import WarhammerActiveEffect from "./document/effect";
import WarhammerBugReport from "./modules/bug-report";
import WarhammerRollDialog from "./apps/roll-dialog";
import WarhammerActiveEffectConfig from "./sheets/effect";
import { WarhammerActiveEffectModel } from "./model/effect";
import { WarhammerActor } from "./document/actor";
import { WarhammerItem } from "./document/item";
import { BaseWarhammerModel } from "./model/base";
import { BaseWarhammerActorModel } from "./model/actor";
import { BaseWarhammerItemModel } from "./model/item";
import defaultWarhammerConfig from "./system/config";
import hooks from "./hooks/hooks";
import { SocketHandlers } from "./util/socket-handlers";
import TokenHelpers from "./util/token-helpers";
import { WarhammerTestBase } from "./system/test";
import AreaTemplate from "./util/area-template";
import { WarhammerMessageModel} from "./model/message";
import { WarhammerTestMessageModel} from "./model/test";
import WarhammerModuleInitializer from "./modules/module-initialization";
import overrides from "./util/overrides";
import { error,
    findAllItems,
    findItemId,
    findKey,
    findUuid,
    getActiveDocumentOwner,
    log,
    replacePopoutPath,
    replacePopoutTokens,
    removeSelfUUID,
    sleep,
    targetedOrAssignedActors,
    sortObjectEntries,
    getPackage,
    getCompendiumName,
    targetsWithFallback,
    registerPremiumModuleInitialization,
    selectedWithFallback
} from "./util/utility";
import { DeferredReferenceListModel, DiffReferenceListModel, DocumentReferenceListModel, ListModel } from "./model/components/list";
import WarhammerActorSheetV2 from "./sheets/actor";
import { SingletonItemModel } from "./model/components/singleton-item";
import WarhammerItemSheetV2 from "./sheets/item";
import addSheetHelpers from "./util/sheet-helpers";
import { WarhammerZoneConfig } from "./apps/zone-config";
import WarhammerDiffEditor from "./apps/diff-editor";
import ChoiceConfigV2 from "./apps/choice-config";
import { ChoiceModel } from "./model/components/choices";
import ChoiceDecision from "./apps/choice-decision";
import { DeferredReferenceModel, DiffReferenceModel, DocumentReferenceModel } from "./model/components/reference";
import WarhammerScriptEditor from "./apps/script-editor";
import { WarhammerRollTable } from "./document/table";
import ChatCommands from "./system/commands";
import { WarhammerContextMenu } from "./util/context-menu";
import WarhammerChatMessage from "./document/message";
import CompendiumBrowser from "./apps/browser/compendium-browser.mjs";
import FilterStateElement from "./elements/filter-state.mjs";
import CheckboxElement from "./elements/checkbox.mjs";
import WarhammerRollDialogV2 from "./apps/roll-dialogV2";
import DraggableApp from "./apps/draggable";
import ContainerizedApp from "./apps/containerized";
import { WHFormApplication } from "./apps/form-application";
import DragDialog from "./apps/drag-dialog.js";
hooks();
overrides();

const forkhammer = {};

forkhammer.utility = {
    log,
    error,
    findKey,
    getActiveDocumentOwner,
    findAllItems,
    findItemId,
    findUuid,
    replacePopoutTokens,
    replacePopoutPath,
    removeSelfUUID,
    addSheetHelpers,
    sleep,
    targetedOrAssignedActors,
    targetsWithFallback,
    selectedWithFallback,
    sortObjectEntries,
    getPackage,
    getCompendiumName,
    registerPremiumModuleInitialization
};

forkhammer.apps = {
    WarhammerScript,
    ItemDialog,
    ValueDialog,
    DragDialog,
    WarhammerScriptEditor,
    WarhammerDiffEditor,
    WarhammerBugReport,
    WarhammerRollDialog,
    WarhammerRollDialogV2,
    WarhammerActiveEffectConfig,
    SocketHandlers,
    defaultWarhammerConfig,
    TokenHelpers,
    WarhammerTestBase,
    AreaTemplate,
    WarhammerModuleInitializer,
    WarhammerActorSheetV2,
    WarhammerItemSheetV2,
    WarhammerZoneConfig,
    ChoiceConfigV2,
    ChoiceDecision,
    ChatCommands,
    WarhammerContextMenu,
    CompendiumBrowser,
    WHFormApplication,
    DraggableApp,
    ContainerizedApp
};

forkhammer.models = {
    BaseWarhammerModel,
    BaseWarhammerActorModel,
    BaseWarhammerItemModel,
    ListModel,
    SingletonItemModel,
    DocumentReferenceModel,
    DocumentReferenceListModel,
    DeferredReferenceModel,
    DeferredReferenceListModel,
    DiffReferenceModel,
    DiffReferenceListModel,
    WarhammerActiveEffectModel,
    WarhammerTestMessageModel,
    WarhammerMessageModel,
    WarhammerActiveEffect,
    ChoiceModel

};

forkhammer.documents = {
    WarhammerActor,
    WarhammerItem,
    WarhammerRollTable,
    WarhammerChatMessage
};

globalThis.forkhammer = forkhammer;

window.customElements.define("forkhammer-filter-state", FilterStateElement);
window.customElements.define("forkhammer-checkbox", CheckboxElement);

// Consumers may initialize immediately or wait until the public API is available.
Hooks.callAll("forkhammerReady", forkhammer);
