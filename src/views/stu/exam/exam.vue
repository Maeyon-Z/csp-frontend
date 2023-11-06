<template>
<div style="margin-top:20px; margin-left:20px; margin-right:10px">
    <el-card class="box-card">
        <template #header>
            <el-row>
                <el-col :span="18"> <span style="font-size:40px">{{ stuExamInfo.examName }} </span> </el-col>
                <el-col :span="6"> 
                    <span v-show="remainder >= 0" style="font-size:30px">{{ "剩余时间：" +  parseInt(remainder/60) + "分" + remainder%60 + "秒" }} </span> 
                    <span v-show="remainder < 0" style="font-size:30px">{{ "考试已结束" }} </span> 
                </el-col>
            </el-row>
        </template>
        <el-row style="margin-bottom:10px"> <span style="font-size:15px">{{ paperInfo.remark }} </span> </el-row>
        <el-row :span="24">
            <el-col :span="6"> <span style="font-size:15px">{{ "考试时长：" + stuExamInfo.duration + "分钟" }} </span> </el-col>
            <el-col :span="8"> <span style="font-size:15px">{{ "开始时间：" + stuExamInfo.startTime }} </span> </el-col>
            <el-col :span="6"> <span style="font-size:15px">{{ "结束时间：" + stuExamInfo.endTime }} </span> </el-col>
            <el-col :span="4"> <el-button type="primary" @click="handleSubmit">交 卷</el-button> </el-col>
        </el-row> 
        <el-divider />
        <el-tabs type="border-card">
            <el-tab-pane label="基础题">
                <BaseInfo ref="baseRef" :paperId="paperId" />
            </el-tab-pane>
            <el-tab-pane label="阅读程序题">
                <ProgramInfo ref="readProgramRef" :type='1' :paperId="paperId"/>
            </el-tab-pane>
            <el-tab-pane label="补全程序题">
                <ProgramInfo ref="completeProgramRef" :type='2' :paperId="paperId"/>
            </el-tab-pane>
        </el-tabs>
    </el-card>
</div>
</template>

<script setup name="Exam">
import { getStuExamById, submitExam } from '@/api/stu/exam'
import { getPaperInfo } from '@/api/stu/paper'
import { useRoute } from "vue-router"
import { ElMessage, ElMessageBox } from 'element-plus'
import BaseInfo from './components/BaseInfo.vue';
import ProgramInfo from './components/ProgramInfo.vue';

const route = useRoute();
const stuExamId = route.params.stuExamId;
const paperId = route.params.paperId;
const data = reactive({
    stuExamInfo: {}, paperInfo: {}, remainder: 0, baseRef: null, readProgramRef: null, completeProgramRef: null, isEnd: false
});
const { 
    stuExamInfo, paperInfo, remainder, baseRef, readProgramRef, completeProgramRef, isEnd
} = toRefs(data);

onMounted(async () => {
    await getStuExamById(stuExamId).then(res => {
        if(res.code === 200){
            stuExamInfo.value = res.data;
        }
    })
    await getPaperInfo(paperId).then(res => {
        if(res.code === 200){
            paperInfo.value = res.data;
        }
    })
    remainder.value = Date.parse(new Date(stuExamInfo.value.endTime))/1000 - Date.parse(new Date())/1000;
    if(remainder.value < 0) isEnd.value = true;
    let timer = null;
    timer = setInterval(() => {
        remainder.value--;
    }, 1000);
})

onBeforeUnmount(() => {
  clearInterval(timer)
  timer = null;
})

watch(remainder, (oldValue, newValue) => {
    if(newValue < 0){
        isEnd.value = true;
    }
})

watch(isEnd, (oldValue, newValue) => {
    if(newValue){
        ElMessage.warning("考试结束，自动交卷！");
        submitForm();
    }
})

const handleSubmit = () => {
    ElMessageBox.confirm('是否确认交卷?', '提示', { confirmButtonText: '确认', cancelButtonText: '取消', type: 'warning' } ).then(() => {
        submitForm();
        ElMessage.success("提交成功")
    })
    .catch(() => {
        ElMessage.info("取消交卷")
    })
}

const submitForm = () => {
    let answer = baseRef.value.baseAnswer;
    readProgramRef.value.exerciseList.forEach(exercise => {
        exercise.quesList.forEach(ques => {
            if(ques.answer != undefined)
                answer[ques.id] = ques.answer
        })
    })
    completeProgramRef.value.exerciseList.forEach(exercise => {
        exercise.quesList.forEach(ques => {
            if(ques.answer != undefined)
                answer[ques.id] = ques.answer
        })
    })

    submitExam({answer: answer, userId: stuExamInfo.value.userId, examId: stuExamInfo.value.examId}).then(res => {
        console.log(123213);
    })
}

</script>

