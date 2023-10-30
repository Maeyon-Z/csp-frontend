<template>
   <div style="margin:20px; ">
      <el-button style="margin-right:5px" type="primary" plain @click="handleAddProgram()" v-hasPermi="['dataControl:exercise:add']">{{ buttonName }}</el-button>
      <el-button v-show=showOther type="primary" plain icon="Plus" @click="handleAddQues()" v-hasPermi="['dataControl:exercise:add']">添加问题</el-button>

      <div v-show=showOther> 
         <div style="margin-top:20px; margin-bottom:10px">
            <div v-if="quesType==1"> {{ "阅读程序题" }} </div>
            <div v-else> {{ "补全程序题" }} </div>
         </div>
         <div class="ql-container ql-snow" style="margin-top:20px">
            <div class="ql-editor">
               <div v-html="exerciseProgram"></div>
            </div>
         </div>
         
      </div>
   
      <el-dialog title="录入题干" v-model="openProgram" width="1000px" append-to-body>
         <el-radio-group v-model="quesType" class="ml-4" style="margin-bottom:10px">
            <el-radio label="1" size="large">阅读程序题</el-radio>
            <el-radio label="2" size="large">补全程序题</el-radio>
         </el-radio-group>
         <Editor v-model="exerciseProgram" :height="400"/>
         <div slot="footer" class="dialog-footer" style="margin-top:10px">
            <el-button type="primary" @click="saveProgram">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
         </div>
      </el-dialog>

      <el-dialog title="录入问题" v-model="openQues" width="1000px" append-to-body>
         <el-form ref="form" :model="form" label-width="80px">
            <el-form-item label="题目" prop="exerciseTitle">
               <Editor v-model=form.exerciseTitle :height="200" />
            </el-form-item>
            <el-form-item label="类型" prop="quesType1">
               <el-radio-group v-model="form.quesType1" class="ml-4" >
                  <el-radio label="1" size="large">选择题</el-radio>
                  <el-radio label="2" size="large">判断题</el-radio>
               </el-radio-group>
            </el-form-item>
         </el-form>

         <!-- <div style="font-size:15px; font-weight:bold; margin-bottom:10px"> {{ "请输入题目:" }} </div>
         <Editor v-model="exerciseTitle" :height="200"/>
         
         <el-row style="font-size:15px; font-weight:bold; margin-top:2px"> 
            <div style="font-size:15px; font-weight:bold; margin-top:8px">{{ "请选择题目类型:" }}</div>
            <el-radio-group v-model="quesType" class="ml-4" style="margin-left:20px">
               <el-radio label="1" size="large">选择题</el-radio>
               <el-radio label="2" size="large">判断题</el-radio>
            </el-radio-group>
         </el-row> -->
         
         <div slot="footer" class="dialog-footer" style="margin-top:10px">
            <el-button type="primary" @click="saveQues">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
         </div>
      </el-dialog>
   </div>

</template>
 
<script setup lang=ts name="ExerciseAdd">
import { addExercise, updateExercise } from "@/api/dataControl/exercise";
import { reactive, ref } from 'vue'

// 添加题目的请求参数
const form = reactive({
   id: '',
   exerciseTitle: '',
   choiceA: '',
   choiceB: '',
   choiceC: '',
   choiceD: '',
   correctAnswer: '',
   analysis: '',
   exerciseType: '',
   quesType1: '',
});
const id = ref('-1');
const quesType = ref('1');
const exerciseType = ref('-1');
const exerciseProgram = ref("");
const exerciseTitle = ref("");

// 控制标志
const showOther = ref(false);
const openProgram = ref(false);
const openQues = ref(false);

// 其他参数
const buttonName = ref('录入题干程序')

const handleAddProgram = () => {
   openProgram.value = true;
}

const handleAddQues = () => {
   quesType.value = -1;
   openQues.value = true;
}

const saveProgram = () => {
   if(id.value == -1){
      addExercise({quesType:quesType.value, exerciseProgram:exerciseProgram.value}).then(response => {
         if(response.code == 200){
            id.value = response.data;
            buttonName.value = '编辑题干程序';
            showOther.value = true;
            openProgram.value = false;
         }
      });
   }else{
      updateExercise({id:id.value, quesType:quesType.value, exerciseProgram:exerciseProgram.value}).then(response => {
         if(response.code == 200){
            buttonName.value = '编辑题干程序';
            showOther.value = true;
            openProgram.value = false;
         }
      });
   }
}

const saveQues = (quesId) => {
   if(quesId == -1){
      addExercise({quesType:quesType.value, exerciseProgram:exerciseProgram.value}).then(response => {
         if(response.code == 200){
            id.value = response.data;
            buttonName.value = '编辑题干程序';
            showOther.value = true;
            openProgram.value = false;
         }
      });
   }else{
      updateExercise({id:quesId, quesType:quesType.value, exerciseProgram:exerciseProgram.value}).then(response => {
         if(response.code == 200){
            buttonName.value = '编辑题干程序';
            showOther.value = true;
            openProgram.value = false;
         }
      });
   }
}

const cancel = () => {
   openProgram.value = false;
   openQues.value = false;
}

</script>
 
<style scope>
.el-dialog__body {
   padding-top:1px;
}
</style>