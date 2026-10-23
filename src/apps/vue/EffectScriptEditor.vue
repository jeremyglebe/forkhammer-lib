<!-- Modified for Forkhammer Lib from Warhammer Library 3.5.1. -->
<script setup>
import { computed } from "vue";
import ScriptField from "./ScriptField.vue";

const props = defineProps({ context: { type: Object, required: true } });
const controls = computed(() => {
    const { scriptData, effect, hasScriptReferences } = props.context;
    return [
        { name: "runIfDisabled", hint: "runIfDisabledHint", show: true },
        { name: "targeter", tooltip: "WH.TargeterTT", show: scriptData.trigger === "dialog" && effect.system.transferData.documentType === "Actor" },
        { name: "defending", tooltip: "WH.DefendingAgainstTT", show: scriptData.trigger === "dialog" },
        { name: "deleteEffect", hint: "deleteEffectHint", show: scriptData.trigger === "immediate" },
        { name: "showDuplicates", hint: "showDuplicatesHint", show: scriptData.trigger === "manual" },
        { name: "scriptLock", action: "toggleLock", show: hasScriptReferences }
    ].filter(control => control.show);
});
const scriptFields = computed(() => {
    const trigger = props.context.scriptData.trigger;
    return trigger === "dialog" ? ["script", "hideScript", "activateScript", "submissionScript"]
        : trigger === "manual" ? ["script", "hideScript"] : ["script"];
});
function scriptValue(name) {
    const context = props.context;
    if (context.lockedScripts[name]) {
        return name === "script" ? context.dereferencedScripts.script : context.dereferencedScripts.options[name];
    }
    return name === "script" ? context.script : context.scriptData.options[name];
}
</script>

<template>
    <div data-application-part="scripts">
        <div class="form-group">
            <label :for="`${context.rootId}-label`">{{ context.labels.label }}</label>
            <div class="form-fields">
                <input :id="`${context.rootId}-label`" name="label" type="text" :aria-label="context.labels.label" :value="context.scriptData.label">
            </div>
        </div>
        <div class="form-group">
            <label :for="`${context.rootId}-trigger`">{{ context.labels.trigger }}</label>
            <div class="form-fields">
                <select :id="`${context.rootId}-trigger`" name="trigger" :aria-label="context.labels.trigger" :value="context.scriptData.trigger">
                    <option v-for="option in context.triggerOptions" :key="option.value" :value="option.value">{{ option.label }}</option>
                </select>
            </div>
        </div>
        <div v-for="control in controls" :key="control.name" class="form-group" :data-tooltip="control.tooltip">
            <label :for="`${context.rootId}-${control.name}`"
                :data-tooltip="control.action ? 'WH.ScriptLockTT' : undefined"
                :data-tooltip-direction="control.action ? 'LEFT' : undefined">
                {{ context.labels[control.name] }}
                <i v-if="control.action" class="fa-regular fa-circle-info"></i>
            </label>
            <div class="form-fields">
                <p v-if="control.hint" class="hint">{{ context.labels[control.hint] }}</p>
                <input :id="`${context.rootId}-${control.name}`"
                    :name="control.action ? undefined : control.name" type="checkbox"
                    :aria-label="context.labels[control.name]"
                    :data-action="control.action"
                    :checked="control.action ? context.scriptLock : context.scriptData.options[control.name]">
            </div>
        </div>
        <hr>
        <div class="script-fields">
            <ScriptField v-for="name in scriptFields" :key="name" :name="name"
                :label="name === 'script' ? (context.scriptData.trigger === 'dialog' ? context.labels.dialogScript : '') : context.labels[name]"
                :value="scriptValue(name)" :locked="context.lockedScripts[name]"
                :is-g-m="context.isGM" :root-id="context.rootId"
                :copy-label="context.labels.copyScript" :editor-label="context.labels.editor" />
        </div>
    </div>
</template>
