<!-- Modified for Forkhammer Lib from Warhammer Library 3.5.1. -->
<script>
export default {
    props: {
        name: { type: String, required: true },
        label: { type: String, default: "" },
        value: { type: String, default: "" },
        locked: Boolean,
        isGM: Boolean,
        rootId: { type: String, required: true },
        copyLabel: { type: String, required: true },
        editorLabel: { type: String, required: true }
    }
};
</script>

<template>
    <div class="form-group stacked script">
        <label :for="`${rootId}-${name}`">
            {{ label }}
            <a data-action="copyScript" :data-script="name" :aria-label="copyLabel"
                role="button" tabindex="0"
                @keydown.enter="event => event.currentTarget.click()"
                @keydown.space.prevent="event => event.currentTarget.click()"
            ><i class="fa-solid fa-copy"></i></a>
        </label>
        <code-mirror :id="`${rootId}-${name}`" :name="locked ? undefined : name"
            language="javascript" :disabled.prop="locked || !isGM"
            :readonly="locked && name === 'script' ? '' : undefined"
            :aria-label="label || editorLabel" :value.prop="value" />
    </div>
</template>
