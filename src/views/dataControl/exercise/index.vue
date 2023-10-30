<template>
    <el-tabs v-model="activeName" class="demo-tabs" style="margin-left: 20px;">
        <el-tab-pane label="基础题" name="base"><BaseExercise/></el-tab-pane>
        <el-tab-pane label="程序题" name="program"><ProgramExercise/></el-tab-pane>
    </el-tabs>
</template>
  
<script lang="ts" setup name="Exercise">
import type { TabsPaneContext } from 'element-plus';
import BaseExercise from './BaseExercise.vue';
import ProgramExercise from './ProgramExercise.vue';

const app = createApp({});
app.component({
    BaseExercise,ProgramExercise
});


const activeName = ref('base');

</script>

<style>
</style>
  