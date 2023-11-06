<template>
<div>
    <el-tabs tab-position="left" style="height: 800px" class="demo-tabs">
        <el-tab-pane v-for="(item, idx) in baseExerciseList" :label="'第'+(idx+1)+'题'">
            <div style="margin:20px">
                <el-row :span="24" style="margin-top:20px; margin-bottom:20px; font-size:30px">
                    {{ "第" + (idx+1) + "题（ " +  item.score + " 分）"}}
                </el-row>
                <div style="font-size:20px" v-html="item.exerciseTitle"> </div>
                <el-radio-group v-model="baseAnswer[item.id]" class="ml-4" style="font-size:20px">
                    <el-radio label="A" size="large">{{ "A、" + item.choiceA }}</el-radio>
                    <el-radio label="B" size="large">{{ "B、" + item.choiceB }}</el-radio>
                    <el-radio label="C" size="large">{{ "C、" + item.choiceC }}</el-radio>
                    <el-radio label="D" size="large">{{ "D、" + item.choiceD }}</el-radio>
                </el-radio-group>
            </div>
        </el-tab-pane>
    </el-tabs>
</div>
</template>

<script setup lang=ts name="BaseInfo">
import { getPaperExercise } from '@/api/stu/paper';
const props = defineProps(['paperId']);
const data = reactive({
    baseExerciseList: [],
    baseAnswer: {}
});
const { baseExerciseList, baseAnswer } = toRefs(data);

onMounted(async () => {
    await getPaperExercise(props.paperId, 0).then(res => {
        if(res.code == 200){
            baseExerciseList.value = res.data;
        }
    })
})

defineExpose({
    baseAnswer,
});
</script>