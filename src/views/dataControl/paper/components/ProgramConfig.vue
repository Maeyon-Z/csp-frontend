<template>
    <div>
        <el-row :span="24" style="margin-bottom:10px">
            <el-button type="primary" icon="Plus" size="small" @click="handleGenExercise">随机生成</el-button>
            <el-button type="primary" icon="Plus" size="small" @click="handleAddExercise">手动新增</el-button>
        </el-row>
        <el-table v-loading="exerciseLoading" :data="exerciseList">
            <el-table-column type="index" label="序号" align="center" width="50" />
            <el-table-column label="题干程序" align="center" prop="exerciseProgram" >
                <template #default="scope">
                    <div v-html="scope.row.exerciseProgram"></div>
                </template>
            </el-table-column>
            <el-table-column label="类型" align="center" prop="quesType">
            <template #default="scope">
                <dict-tag :options="sys_exercise_cate" :value="scope.row.quesType"/>
            </template>
            </el-table-column>
            <el-table-column label="备注" align="center" prop="remark" />
            <el-table-column label="分值" align="center" prop="score" />
            <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                <template #default="scope">
                    <el-button link type="primary" icon="Search" @click="exerciseInfo(scope.row)">详情</el-button>
                    <el-button link type="primary" icon="Edit" @click="handleChangeExerciseScore(scope.row)">修改分值</el-button>
                    <el-button link type="primary" icon="Delete" @click="deleteExercise(scope.row)">删除</el-button>
                </template>
            </el-table-column>
        </el-table>
    
        <el-dialog title="随机生成程序题" v-model="showGenExercise" width="500px" append-to-body>
            <el-form ref="genExerciseConfigFormRef" :model="genExerciseConfigForm" :rules="genExerciseConfigFormRules" label-width="80px">
            <el-form-item label="题目数量" prop="count">
                <el-input-number :min="1" :max="100" style="width:200px" v-model="genExerciseConfigForm.count" placeholder="请输入题目数量" />
            </el-form-item>
            <el-form-item label="题目分值" prop="score">
                <el-input-number :min="1" :max="100" style="width:200px" v-model="genExerciseConfigForm.score" placeholder="每一问分值" />
            </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitGenExerciseForm">确 定</el-button>
                <el-button @click="cancel">取 消</el-button>
            </div>
        </el-dialog>
        <el-dialog title="题目详情" v-model="showExerciseInfo" width="1000px" append-to-body>
            <ProgramExerciseInfo :key="showExerciseInfo" :exerciseId="showExerciseId" :scoreList="showExerciseScoreList" :edit="false" :add="false"/>
        </el-dialog>
        <el-dialog title="编辑分数" v-model="showEditExerciseInfo" width="1000px" append-to-body>
            <ProgramExerciseInfo @scoreChange="changeScore" :key="showEditExerciseInfo" :exerciseId="showExerciseId" :scoreList="showExerciseScoreList" :edit="true" :add="false"/>
        </el-dialog>
        <el-dialog title="手动新增" v-model="showAddExercise" width="1300px" append-to-body>
            <el-row :span="24">
                <el-col :span="6" style="padding-right:10px">
                    <el-row> <span style="font-size:18px; font-weight:bold; height:40px"> 请选择题目 </span> </el-row>
                    <el-radio-group v-model="selectExerciseId" size="small">
                        <el-radio-button size="default" v-for="(data, idx) in exerciseIds" :label="data"> {{ idx+1 }} </el-radio-button>
                    </el-radio-group>
                </el-col>
                <el-col :span="18">
                    <div v-if="selectExerciseId != 0">
                        <ProgramExerciseInfo @addExercise="saveAddExercise" :key="selectExerciseId" :exerciseId="selectExerciseId" :scoreList="{}" :edit="false" :add="true"/>
                    </div>
                </el-col>
            </el-row>
        </el-dialog>
    </div>
</template>
    
<script setup lang=ts name="ProgramConfig">
import { genExercise, getExerciseIds } from "@/api/dataControl/paper";
import ProgramExerciseInfo from './ProgramExerciseInfo.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
const { proxy } = getCurrentInstance();
const { sys_exercise_cate } = proxy.useDict("sys_exercise_cate");
const emits = defineEmits(['readProgramScoreChange', 'readProgramExerciseChange', 'completeProgramScoreChange', 'completeProgramExerciseChange'])
const props = defineProps(['type'])
const data = reactive({
    // 题目列表相关参数
    exerciseLoading: false, exerciseList: [], 
    // 随机生成题目对话框相关参数
    showGenExercise: false, genExerciseConfigForm: {}, genExerciseConfigFormRules:[],
    // 程序题总分
    exerciseSumScore: 0,
    // 题目详情对话框相关参数
    showExerciseInfo: false, showExerciseId: 0, showExerciseScoreList:[],
    // 编辑题目相关参数
    showEditExerciseInfo: false,
    // 手动新增相关参数
    showAddExercise: false, selectExerciseId: 0, exerciseIds: [], 
});
const {
    exerciseLoading, exerciseList, 
    showGenExercise, genExerciseConfigForm, genExerciseConfigFormRules,
    exerciseSumScore,
    showExerciseInfo, showExerciseId, showExerciseScoreList,
    showEditExerciseInfo,
    showAddExercise, selectExerciseId, exerciseIds,
} = toRefs(data);

// 随机生成题目相关方法                            
const handleGenExercise = () => {
    reset();
    showGenExercise.value = true;
}
const submitGenExerciseForm = () => {
    proxy.$refs["genExerciseConfigFormRef"].validate(valid => {
        if (valid) {
            exerciseLoading.value = true;
            genExercise(genExerciseConfigForm.value, props.type).then(res => {
                exerciseList.value = [];
                exerciseSumScore.value = 0;
                if(res.code === 200){
                    exerciseList.value = res.data;
                    exerciseList.value.forEach(ele =>{
                        exerciseSumScore.value += ele.score;
                    })
                }
            })
            showGenExercise.value = false;
            exerciseLoading.value = false;
        }
    });
}
// 查看题目详情
const exerciseInfo = (row) => {
    showExerciseId.value = row.id;
    showExerciseScoreList.value = row.scoreList;
    showExerciseInfo.value = true;
}
// 修改分值相关方法
const handleChangeExerciseScore = (row) => {
    showExerciseId.value = row.id;
    showExerciseScoreList.value = row.scoreList;
    showEditExerciseInfo.value = true;
}
const changeScore = (data) => {
    let score = 0;
    console.log(data);
   
    Object.keys(data.scoreList).forEach(function (key) {
        score += data.scoreList[key];
    });
    const a = exerciseList.value.find(ele => ele.id == data.id);
    exerciseSumScore.value -= a.score;
    a.score = score;
    exerciseSumScore.value += a.score;
    a.scoreList = data.scoreList;
}
// 删除题目相关方法
const deleteExercise = (row) => {
    exerciseLoading.value = true;
    const data = exerciseList.value.filter((item) => {
        if(item.id == row.id){
            exerciseSumScore.value -= item.score;
        }
        return item.id != row.id;
    })
    exerciseList.value = data;
    exerciseLoading.value = false;
}
// 手动新增相关方法
const handleAddExercise = () => {
    reset();
    exerciseIds.value = [];
    getExerciseIds(props.type).then(res => {
        if(res.code === 200){
            exerciseIds.value = res.data;
        }
    })
    showAddExercise.value = true;
}
const saveAddExercise = (data) => {
    const res = exerciseList.value.find(ele => ele.id == data.id);
    if(!res){
        exerciseSumScore.value += data.score;
        exerciseList.value.push(data);
        ElMessage.success("添加成功");
        showAddExercise.value = false;
    }else{
        ElMessage.error("题目已存在");
    }
}

function reset() {
    genExerciseConfigForm.value = {
        count: undefined,
        score: undefined,
    };
    selectExerciseId.value = 0;
    proxy.resetForm("genExerciseConfigFormRef");
}
const cancel = () =>{
    reset();
    showGenExercise.value = false;
    showAddExercise.value = false;
    showExerciseInfo.value = false;
    showEditExerciseInfo.value = false;
}

// 监视器
watch(exerciseSumScore, (newValue,oldValue) => {
    if(props.type == 1){
        emits("readProgramScoreChange", newValue);
    }else{
        emits("completeProgramScoreChange", newValue);
    }
})
watch(exerciseList, (newValue,oldValue) => {
    const exerciseInfos = [];
    newValue.forEach(element => {
        const data = {};
        data.id = element.id;
        data.score = element.score;
        data.scoreList = element.scoreList;
        exerciseInfos.push(data);
    });
    if(props.type == 1){
        emits("readProgramExerciseChange", exerciseInfos);
    }else{
        emits("completeProgramExerciseChange", exerciseInfos);
    }
}, {deep:true})
</script>