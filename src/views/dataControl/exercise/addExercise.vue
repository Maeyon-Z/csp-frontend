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
   
      <el-dialog :title=buttonName v-model="openProgram" width="1000px" append-to-body>
         <el-radio-group v-model="quesType" class="ml-4" style="margin-bottom:10px">
            <el-radio label="1" size="large">阅读程序题</el-radio>
            <el-radio label="2" size="large">补全程序题</el-radio>
         </el-radio-group>
         <Editor :key="openProgram" v-model="exerciseProgram" :height="400"/>
         <div slot="footer" class="dialog-footer" style="margin-top:10px">
            <el-button type="primary" @click="saveProgram">确 定</el-button>
            <el-button @click="cancel(quesFormRef)">取 消</el-button>
         </div>
      </el-dialog>

      <el-dialog title="录入问题" v-model="openQues" width="1000px" append-to-body>
         <el-form :model="form" label-width="80px" :rules="rules" ref="quesFormRef">
            <el-form-item label="题目" prop="exerciseTitle">
               <Editor :key="openQues" v-model=form.exerciseTitle :height="200" />
            </el-form-item>
            <el-form-item label="类型" prop="quesType">
               <el-radio-group v-model="form.quesType" class="ml-4" >
                  <el-radio label=1 size="large">选择题</el-radio>
                  <el-radio label=2 size="large">判断题</el-radio>
               </el-radio-group>
            </el-form-item>
            <div v-if="form.quesType==='1'">
               <el-row :span="24">
                  <el-col :span="12">
                     <el-form-item label="选项A" prop="choiceA">
                     <el-input v-model="form.choiceA" placeholder="请输入选项A" />
                     </el-form-item>
                  </el-col>
                  <el-col :span="12">
                     <el-form-item label="选项B" prop="choiceB">
                     <el-input v-model="form.choiceB" placeholder="请输入选项B" />
                     </el-form-item>
                  </el-col>
               </el-row>
               <el-row :span="24">
                  <el-col :span="12">
                     <el-form-item label="选项C" prop="choiceC">
                     <el-input v-model="form.choiceC" placeholder="请输入选项C" />
                     </el-form-item>
                  </el-col>
                  <el-col :span="12">
                     <el-form-item label="选项D" prop="choiceD">
                     <el-input v-model="form.choiceD" placeholder="请输入选项D" />
                     </el-form-item>
                  </el-col>
               </el-row>
               <el-form-item label="答案" prop="correctAnswer">
                  <el-radio-group v-model="form.correctAnswer" class="ml-4">
                     <el-radio label="A" size="large">选项A</el-radio>
                     <el-radio label="B" size="large">选项B</el-radio>
                     <el-radio label="C" size="large">选项C</el-radio>
                     <el-radio label="D" size="large">选项D</el-radio>
                  </el-radio-group>
               </el-form-item>
            </div>
            <div v-if="form.quesType==='2'">
               <el-form-item label="答案" prop="correctAnswer">
                  <el-radio-group v-model="form.correctAnswer" class="ml-4">
                     <el-radio label="正确" size="large">正确</el-radio>
                     <el-radio label="错误" size="large">错误</el-radio>
                  </el-radio-group>
               </el-form-item>
            </div>
            <el-form-item label="答案解析" prop="analysis">
               <el-input v-model="form.analysis" placeholder="请输入答案解析" type="textarea" />
            </el-form-item>
         </el-form>
         <div slot="footer" class="dialog-footer" style="margin-top:10px">
            <el-button type="primary" @click="saveQues(quesFormRef)">确 定</el-button>
            <el-button @click="cancel(quesFormRef)">取 消</el-button>
         </div>
      </el-dialog>
   </div>

</template>
 
<script setup lang=ts name="EditProgramExercise">
import { addExercise, updateExercise, getQues } from "@/api/dataControl/exercise";
import { reactive, ref } from 'vue'
import type { FormInstance, FormRules } from 'element-plus'

// 变量
interface QuesForm {
   id: long,
   parentId:long
   exerciseTitle: string
   choiceA: string
   choiceB: string
   choiceC: string
   choiceD: string
   correctAnswer: boolean
   analysis: string
   exerciseType: long
   quesType: long
}
const form = reactive<QuesForm>({
   id: -1,
   parentId:-1,
   exerciseTitle: '',
   choiceA: '',
   choiceB: '',
   choiceC: '',
   choiceD: '',
   correctAnswer: '',
   analysis: '',
   exerciseType: -1,
   quesType: -1,
});
const quesFormRef = ref<FormInstance>()
const id = ref(-1);
const quesType = ref('1');
const exerciseProgram = ref("");

// 控制标志
const showOther = ref(false);
const openProgram = ref(false);
const openQues = ref(false);

// 其他参数
const buttonName = ref('录入题干程序')

const handleAddProgram = () => {
   exerciseProgram.value = showOther.value ? exerciseProgram.value : "";
   quesType.value = '1';
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

const saveQues = async (formEl: FormInstance | undefined) => {
   if (!formEl) return
   await formEl.validate((valid, fields) => {
      if (valid) {
         form.parentId = id.value;
         form.quesType = quesType.value;
         if(form.id != -1){
            updateExercise(form).then(response => {
               if(response.code == 200){
                  showOther.value = true;
                  openQues.value = false;
               }
            });
         }else{
            addExercise(form).then(response => {
               if(response.code == 200){
                  id.value = response.data;
                  buttonName.value = '编辑题干程序';
                  showOther.value = true;
                  openQues.value = false;
               }
            });
         }
         resetForm(formEl);
      }
   })
}

const cancel = (formEl: FormInstance | undefined) => {
   resetForm(formEl)
   openProgram.value = false;
   openQues.value = false;
}

const resetForm = (formEl: FormInstance | undefined) => {
  if (!formEl) return
  formEl.resetFields()
}

// 校验规则
const rules = reactive<FormRules<QuesForm>>({
   exerciseTitle: [
    { required: true, message: '题目描述不能为空', trigger: 'blur' },
   ],
   quesType: [
    { required: true, message: '请选择类型', trigger: 'blur' },
   ],
   choiceA: [
    { required: true, message: '选项A不能为空', trigger: 'blur' },
   ],
   choiceB: [
    { required: true, message: '选项B不能为空', trigger: 'blur' },
   ],
   choiceC: [
    { required: true, message: '选项C不能为空', trigger: 'blur' },
   ],
   choiceD: [
    { required: true, message: '选项D不能为空', trigger: 'blur' },
   ],
   correctAnswer: [
    { required: true, message: '请选择正确答案', trigger: 'blur' },
   ],
  
})
</script>
 
<style scope>
.el-dialog__body {
   padding-top:1px;
}
</style>