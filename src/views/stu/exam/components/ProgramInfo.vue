<template>
    <div>
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
                </template>
            </el-table-column>
        </el-table>
    
        <el-dialog title="题目详情" v-model="showExerciseInfo" width="1000px" append-to-body>
            <ProgramExerciseInfo :key="showExerciseId" :exerciseId="showExerciseId" :scoreList="showExerciseScoreList" :edit="false" :add="false"/>
        </el-dialog>
        
    </div>
</template>
    
<script setup lang=ts name="ProgramInfo">
import ProgramExerciseInfo from './ProgramExerciseInfo.vue'
import { getPaperExercise } from '@/api/stu/paper';
const { proxy } = getCurrentInstance();
const { sys_exercise_cate } = proxy.useDict("sys_exercise_cate");
const props = defineProps(['type', 'paperId'])
const data = reactive({
    // 题目列表相关参数
    exerciseLoading: false, exerciseList: [], 
    // 题目详情对话框相关参数
    showExerciseInfo: false, showExerciseId: 0, showExerciseScoreList:[],
});
const {
    exerciseLoading, exerciseList, 
    showExerciseInfo, showExerciseId, showExerciseScoreList,
} = toRefs(data);

onMounted(() => {
    getExercise();
})

const getExercise = () => {
    exerciseLoading.value = true;
    getPaperExercise(props.paperId, props.type).then(res => {
        if(res.code == 200){
            exerciseList.value = res.data;
        }
    })
    exerciseLoading.value = false;
}


// 查看题目详情
const exerciseInfo = (row) => {
    showExerciseId.value = row.id;
    showExerciseScoreList.value = row.scoreList;
    showExerciseInfo.value = true;
}

</script>