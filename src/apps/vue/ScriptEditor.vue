<!-- Modified for Forkhammer Lib from Warhammer Library 3.5.1. -->
<script>
export default {
    props: { context: { type: Object, required: true } }
};
</script>

<template>
    <div data-application-part="editor">
        <code-mirror language="javascript" indent="2" name="script"
            :aria-label="context.labels.editor" :value.prop="context.script ?? ''" />
    </div>
    <footer class="form-footer" data-application-part="footer">
        <button type="submit">
            <i class="fa-solid fa-save" inert></i>
            <span>{{ context.labels.submit }}</span>
        </button>
    </footer>
</template>
