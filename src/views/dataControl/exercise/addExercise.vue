<template>
    <div style="margin-left:100px; margin-right:100px">
       新增题目
       <Editor @update:modelValue="editorChange"/>
    </div>
</template>
 
<script setup name="ExerciseAdd">

const editorChange = (content) => {
   console.log(12321321);
   console.log(content);
}

</script>
 