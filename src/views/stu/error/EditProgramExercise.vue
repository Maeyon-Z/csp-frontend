<template>
 <div style="margin:10px; ">
  <el-form :model="exerciseForm" label-width="80px" ref="exerciseFormRef">
   <el-row :span="24" style="margin-bottom:10px">
    <el-col :span="18">
        <div v-if="exerciseForm.quesType==1"> <span style="font-weight:bold; font-size:20px"> {{ "阅读程序题 " + exerciseForm.remark }} </span> </div>
        <div v-else> <span style="font-weight:bold; font-size:20px"> {{ "补全程序题 " + exerciseForm.remark  }} </span> </div>
    </el-col>
   </el-row>
   <el-form-item label="题干程序" prop="exerciseProgram"> 
    <!-- <div class="ql-container ql-snow" style="padding-left:10px; padding-right:10px;">
        <div v-html="exerciseForm.exerciseProgram"></div>
    </div> -->
    <Editor :key="openProgram" v-model="exerciseForm.exerciseProgram" :readOnly="true" :height="400"/>
   </el-form-item>
  </el-form>

  <div v-for="(ques, idx) in quesList" style="margin-bottom:10px" v-loading="loading">
   <el-row :span="24">
    <el-col :span="2">
     <span style="font-weight:bold; font-size:15px; float:right; margin-right:10px; margin-top:13px">{{ "第" + (idx+1) + "题："}}</span>
    </el-col>
    <el-col :span="22">
        <div class="ql-container ql-snow" style="font-size:15px; padding-left:10px">
            <div v-html="ques.exerciseTitle"></div>
            <div v-if="ques.exerciseType === 0">
                <el-row :span="24">
                    <el-col :span="6"> {{ "A、" + ques.choiceA }} </el-col>
                    <el-col :span="6"> {{ "B、" + ques.choiceB }} </el-col>
                    <el-col :span="6"> {{ "C、" + ques.choiceC }} </el-col>
                    <el-col :span="6"> {{ "D、" + ques.choiceD }} </el-col>
                </el-row>
            </div>
            <div style="margin-top:10px"> 
                <span> {{ "答案：" + ques.correctAnswer }} </span> 
            </div>
            <div style="margin-top:10px"> 
                <span> {{ "解析：" + ques.analysis }} </span> 
            </div>
        </div>
    </el-col>
   </el-row>
  </div>

 </div>
 
</template>
  
<script setup lang=ts name="EditProgramExercise">
 import { getExercise, getQues } from "@/api/stu/exercise";
 const { proxy } = getCurrentInstance();
 const props = defineProps(['exerciseId'])

 interface FormInterface {
   id: long,
   parentId:long
   exerciseTitle: string
   exerciseProgram: string
   choiceA: string
   choiceB: string
   choiceC: string
   choiceD: string
   correctAnswer: boolean
   analysis: string
   exerciseType: string
   quesType: string
   remark: string
 }
 const exerciseForm = reactive<FormInterface>({
   id: -1,
   parentId:-1,
   exerciseTitle: '',
   exerciseProgram: '',
   choiceA: '',
   choiceB: '',
   choiceC: '',
   choiceD: '',
   correctAnswer: '',
   analysis: '',
   exerciseType: '-1',
   quesType: '-1',
   remark: '',
 });
 const quesList = ref([]);
 const loading = ref(false);


 onMounted(() => {
  loading.value = true;
  getExerciseById(props.exerciseId);
  getExerciseQues(props.exerciseId);
  loading.value = false;
 })

 const getExerciseById = (id) => {
    getExercise(id).then(res => {
        if(res.code === 200){
            Object.assign(exerciseForm, res.data);
            exerciseForm.quesType = exerciseForm.quesType + '';
            if(exerciseForm.remark == null) exerciseForm.remark='';
        }
    })
 }

 const getExerciseQues = (parentId) => {
    quesList.value = [];
    getQues(parentId).then(res => {
        if(res.code === 200){
            Object.assign(quesList.value, res.data);
        }
    })
 }

 </script>
  
 <style scope>
 .el-dialog__body {
    padding-top:1px;
 }
 </style>