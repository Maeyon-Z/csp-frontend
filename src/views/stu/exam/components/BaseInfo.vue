<template>
<div>
    <el-table v-loading="baseLoading" :data="baseExerciseList">
        <el-table-column type="index" label="序号" align="center" width="50" />
        <el-table-column label="题目描述" align="center" prop="exerciseTitle" >
            <template #default="scope">
            <div v-html="scope.row.exerciseTitle"></div>
            </template>
        </el-table-column>
        <el-table-column label="选项A" align="center" prop="choiceA" />
        <el-table-column label="选项B" align="center" prop="choiceB" />
        <el-table-column label="选项C" align="center" prop="choiceC" />
        <el-table-column label="选项D" align="center" prop="choiceD" />
        <el-table-column label="正确答案" align="center" prop="correctAnswer" />
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="分值" align="center" prop="score" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
                <el-button link type="primary" icon="Search" @click="baseInfo(scope.row)">详情</el-button>

            </template>
        </el-table-column>
    </el-table>

    <el-dialog title="题目详情" v-model="showBaseInfo" width="1000px" append-to-body>
        <el-form ref='baseInfoFormRef' :model="baseInfoForm" label-width="80px">
            <el-row v-show="baseInfoForm.remark!=null && baseInfoForm.remark != ''">
                <span style="font-size:18px; font-weight:bold; height:40px"> {{ baseInfoForm.remark }} </span>
            </el-row>
            <Editor :key="baseInfoForm.id" v-model="baseInfoForm.exerciseTitle" :readOnly="true" :height="300"/>
            <el-row :span="24" style="margin-top:20px; margin-bottom:20px">
                <el-col :span="6"> {{ "A、" + baseInfoForm.choiceA }} </el-col>
                <el-col :span="6"> {{ "B、" + baseInfoForm.choiceB }} </el-col>
                <el-col :span="6"> {{ "C、" + baseInfoForm.choiceC }} </el-col>
                <el-col :span="6"> {{ "D、" + baseInfoForm.choiceD }} </el-col>
            </el-row>
            <div style="font-size:15px; font-weight:bold; margin-top:10px" >答案：{{ baseInfoForm.correctAnswer }}</div>
            <div style="font-size:15px; font-weight:bold; margin-top:10px" >解析：{{ baseInfoForm.analysis }}</div>
            <div style="font-size:15px; font-weight:bold; margin-top:10px" >分值：{{ baseInfoForm.score }}</div>
        </el-form>
    </el-dialog>
</div>
</template>

<script setup lang=ts name="BaseInfo">
import { getPaperExercise } from '@/api/stu/paper';

const props = defineProps(['paperId']);
const { proxy } = getCurrentInstance();
const data = reactive({
    showBaseInfo: false,
    baseInfoForm:{},
    baseLoading: false,
    baseExerciseList: []
});
const { baseInfoForm, showBaseInfo, baseLoading, baseExerciseList } = toRefs(data);

onMounted(() => {
    getExercise();
})

const getExercise = () => {
    baseLoading.value = true;
    getPaperExercise(props.paperId, 0).then(res => {
        if(res.code == 200){
            baseExerciseList.value = res.data;
        }
    })
    baseLoading.value = false;
}

const baseInfo = (row) => {
    reset();
    baseInfoForm.value = row;
    showBaseInfo.value = true;
}

function reset() {
    baseInfoForm.value = {
        id: null,
        exerciseTitle: '',
        choiceA: null,
        choiceB: null,
        choiceC: null,
        choiceD: null,
        correctAnswer: null,
        analysis: null,
        remark: null,
        exerciseType: 0,
        quesType: 0,
        score: 0
    };
    proxy.resetForm("baseInfoFormRef");
}
const cancel = () =>{
    reset();
    showBaseInfo.value = false;
}
</script>