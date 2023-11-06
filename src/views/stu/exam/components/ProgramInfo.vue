<template>
    <div>
        <el-tabs tab-position="left" class="demo-tabs">
            <el-tab-pane v-for="(item, idx) in exerciseList" :label="'第'+(idx+1)+'题'">
                <div style="margin:20px">
                    <el-row :span="24" style="margin-top:20px; margin-bottom:20px; font-size:30px">
                        {{ "第" + (idx+1) + "题（ " +  item.score + " 分）"}}
                    </el-row>
                    <div style="font-size:20px" v-html="item.exerciseProgram"> </div>
                    <div v-for="(ques, id) in item.quesList" style="font-size:20px">
                        <div style="font-size:20px" v-html="ques.exerciseTitle"> </div>
                        <el-radio-group v-model="ques.answer" v-show="ques.exerciseType == 0" class="ml-4" style="font-size:20px">
                            <el-radio label="A" size="large">{{ "A、" + ques.choiceA }}</el-radio>
                            <el-radio label="B" size="large">{{ "B、" + ques.choiceB }}</el-radio>
                            <el-radio label="C" size="large">{{ "C、" + ques.choiceC }}</el-radio>
                            <el-radio label="D" size="large">{{ "D、" + ques.choiceD }}</el-radio>
                        </el-radio-group>
                        <el-radio-group v-model="ques.answer" v-show="ques.exerciseType == 1" class="ml-4" style="font-size:20px">
                            <el-radio label="正确" size="large">{{ "正确" }}</el-radio>
                            <el-radio label="错误" size="large">{{ "错误" }}</el-radio>
                        </el-radio-group>
                    </div>
                </div>
            </el-tab-pane>
        </el-tabs>
    </div>
</template>
    
<script setup lang=ts name="ProgramInfo">
import { getQues } from "@/api/stu/exercise";
import { getPaperExercise } from '@/api/stu/paper';

const props = defineProps(['type', 'paperId'])
const data = reactive({
    exerciseList: [], exerciseAnswer: {}
});
const {
    exerciseList, exerciseAnswer
} = toRefs(data);

onMounted(async () => {
    await getPaperExercise(props.paperId, props.type).then(res => {
        if(res.code == 200){
            exerciseList.value = res.data;
        }
    })
    await exerciseList.value.forEach(exercise => {   
        exercise.quesList = []
        getQues(exercise.id).then(res => {
            if(res.code === 200){
                res.data.forEach(ques => {
                    ques.score = exercise.scoreList[ques.id];
                    ques.answer = null;
                })
                exercise.quesList = res.data;
            }
        })
    })
})

defineExpose({
    exerciseList
});
</script>