<template>
    <div :key="refresh" style="margin:20px">
        <el-form ref="paperFormRef" :model="paperForm" :rules="paperRules" label-width="80px">
          <el-row :span="24">
            <el-col :span="12">
                <el-form-item label="试卷名称" prop="paperName">
                    <el-input v-model="paperForm.paperName" placeholder="请输入试卷名称" />
                </el-form-item>
            </el-col>
            <el-form-item label="备注" prop="remark">
                <el-input v-model="paperForm.remark" placeholder="请输入备注信息" />
            </el-form-item>
            <el-button style="margin-left:100px" type="primary" @click="submitSavePaper">保 存</el-button>
          </el-row>
        </el-form>
        <el-divider :key="sumScore.value" content-position="left" style="margin-bottom:35px">
            {{ "下面设置试卷题目，当前卷面总分：" +  sumScore + "，其中基础题" + baseScore + "分，阅读程序题" + readProgramScore + "分，补全程序题" + completionProgramScore + "分"}}
        </el-divider>
        <el-form ref="exerciseFormRef" label-width="80px">
            <el-tabs type="border-card">
                <el-tab-pane label="基础题">
                    <BaseConfig @baseScoreChange="changeBaseScore" @baseExerciseChange="changeBaseExercise"/>
                </el-tab-pane>
                <el-tab-pane label="阅读程序题">
                    <ProgramConfig :type="1" @readProgramScoreChange="changeReadProgramScore" @readProgramExerciseChange="changeReadProgramExercise"/>
                </el-tab-pane>
                <el-tab-pane label="补全程序题">
                    <ProgramConfig :type="2" @completeProgramScoreChange="changeCompleteProgramScore" @completeProgramExerciseChange="changeCompleteProgramExercise"/>
                </el-tab-pane>
            </el-tabs>
        </el-form>
    </div>
</template>

<script setup name="AddPaper">
import BaseConfig from './components/BaseConfig.vue';
import ProgramConfig from './components/ProgramConfig.vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import { savePaper } from '@/api/dataControl/paper';
import { useRouter } from "vue-router";
const router = useRouter();
const { proxy } = getCurrentInstance();
const data = reactive({
    // 试卷题目form
    paperForm: {}, paperRules: {paperName: [{ required: true, message: "试卷名称不能为空", trigger: "blur" }]},
    //分值相关参数
    sumScore: 0, baseScore:0, readProgramScore: 0, completionProgramScore: 0,
    //题目列表
    baseExerciseList:[], readProgramList:[], completionProgramList:[],   
    refresh: false,
});
const { paperForm, paperRules,
    sumScore, readProgramScore, completionProgramScore, baseScore,
    baseExerciseList, readProgramList, completionProgramList,
    refresh,
} = toRefs(data);

const submitSavePaper = () => {
    if(sumScore.value != 100){
        ElMessage.warning("总分必须为100分");
    }else{
        proxy.$refs["paperFormRef"].validate(valid => {
            if (valid) {
                ElMessageBox.confirm(
                    '是否确认保存此试卷?','提示',
                    {confirmButtonText: '确认',cancelButtonText: '取消',type: 'info',}
                ).then(() => {
                    const data = {};
                    data.paperName = paperForm.value.paperName;
                    data.remark = paperForm.value.remark;
                    data.baseExerciseList = baseExerciseList.value;
                    data.readProgramList = readProgramList.value;
                    data.completionProgramList = completionProgramList.value;
                    savePaper(data).then(res => {
                        if(res.code === 200){
                            ElMessage.success("保存成功");
                            reset();
                            router.push('/dataControl/paper');
                        }
                    })
                })
                .catch(() => {
                    ElMessage({type: 'info',message: '取消保存',})
                })
            }
        });
    }
    
}

const changeBaseScore = (newScore) => {
    sumScore.value -= baseScore.value;
    baseScore.value = newScore;
    sumScore.value += baseScore.value;
}
const changeBaseExercise = (newBaseExercise) => {
    baseExerciseList.value = newBaseExercise;
}
const changeReadProgramScore = (newScore) => {
    sumScore.value -= readProgramScore.value;
    readProgramScore.value = newScore;
    sumScore.value += readProgramScore.value;
}
const changeReadProgramExercise = (newBaseExercise) => {
    readProgramList.value = newBaseExercise;
}
const changeCompleteProgramScore = (newScore) => {
    sumScore.value -= completionProgramScore.value;
    completionProgramScore.value = newScore;
    sumScore.value += completionProgramScore.value;
}
const changeCompleteProgramExercise = (newBaseExercise) => {
    completionProgramList.value = newBaseExercise;
}
function reset() {
    paperForm.value = {
        paperName: undefined,
        remark: undefined,
    };
    refresh.value = !refresh.value;
    sumScore.value = 0;
    readProgramScore.value = 0;
    completionProgramScore.value = 0;
    baseScore.value = 0;
    proxy.resetForm("paperFormRef");
}
</script>