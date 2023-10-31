<template>
 <div style="margin:10px; ">
  <el-form :model="exerciseForm" label-width="80px" ref="exerciseFormRef">
   <el-row :span="24">
    <el-col :span="20">
        <el-form-item label="题目类型" prop="quesType">
            <el-radio-group v-model="exerciseForm.quesType" class="ml-4" >
            <el-radio label="1" size="large">阅读程序题</el-radio>
            <el-radio label="2" size="large">补全程序题</el-radio>
            </el-radio-group>
        </el-form-item>
    </el-col>
    <el-col :span="4">
        <el-button type="primary" icon="Plus" @click="addQues()" v-hasPermi="['dataControl:exercise:add']">新增问题</el-button>
    </el-col>
   </el-row>
   <el-form-item label="题干程序" prop="exerciseProgram"> 
    <Editor v-model="exerciseForm.exerciseProgram" :height="400"/>
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
            <div style="float:right; margin-right:10px; margin-bottom:10px"> 
                <el-button type="primary" icon="Edit" @click="updateQues(ques)" v-hasPermi="['dataControl:exercise:edit']">修改</el-button>
                <el-button type="primary" icon="Delete" @click="deleteQues(ques)" v-hasPermi="['dataControl:exercise:remove']">删除</el-button>
            </div>
        </div>
    </el-col>
   </el-row>
  </div>

  <el-dialog :title="title" v-model="open" width="1000px" append-to-body>
    <el-form :model="quesForm" label-width="80px" ref="quesFormRef" :rules="quesRules">
    <el-form-item label="题目" prop="exerciseTitle">
        <Editor :key="open" v-model=quesForm.exerciseTitle :height="200" />
    </el-form-item>
    <el-form-item label="类型" prop="exerciseType">
        <el-radio-group v-model="quesForm.exerciseType" class="ml-4" >
            <el-radio label='0' size="large">选择题</el-radio>
            <el-radio label='1' size="large">判断题</el-radio>
        </el-radio-group>
    </el-form-item>
    <div v-if="quesForm.exerciseType==='0'">
        <el-row :span="24">
            <el-col :span="12">
                <el-form-item label="选项A" prop="choiceA">
                <el-input v-model="quesForm.choiceA" placeholder="请输入选项A" />
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item label="选项B" prop="choiceB">
                <el-input v-model="quesForm.choiceB" placeholder="请输入选项B" />
                </el-form-item>
            </el-col>
        </el-row>
        <el-row :span="24">
            <el-col :span="12">
                <el-form-item label="选项C" prop="choiceC">
                <el-input v-model="quesForm.choiceC" placeholder="请输入选项C" />
                </el-form-item>
            </el-col>
            <el-col :span="12">
                <el-form-item label="选项D" prop="choiceD">
                <el-input v-model="quesForm.choiceD" placeholder="请输入选项D" />
                </el-form-item>
            </el-col>
        </el-row>
        <el-form-item label="答案" prop="correctAnswer">
            <el-radio-group v-model="quesForm.correctAnswer" class="ml-4">
                <el-radio label="A" size="large">选项A</el-radio>
                <el-radio label="B" size="large">选项B</el-radio>
                <el-radio label="C" size="large">选项C</el-radio>
                <el-radio label="D" size="large">选项D</el-radio>
            </el-radio-group>
        </el-form-item>
    </div>
    <div v-if="quesForm.exerciseType==='1'">
        <el-form-item label="答案" prop="correctAnswer">
            <el-radio-group v-model="quesForm.correctAnswer" class="ml-4">
                <el-radio label="正确" size="large">正确</el-radio>
                <el-radio label="错误" size="large">错误</el-radio>
            </el-radio-group>
        </el-form-item>
    </div>
    <el-form-item label="答案解析" prop="analysis">
        <el-input v-model="quesForm.analysis" placeholder="请输入答案解析" type="textarea" />
    </el-form-item>
    </el-form>
    <div slot="footer" class="dialog-footer" style="margin-top:10px">
     <el-button type="primary" @click="saveQues()">确 定</el-button>
     <el-button @click="cancel()">取 消</el-button>
    </div>
  </el-dialog>
 </div>
 
</template>
  
<script setup lang=ts name="EditProgramExercise">
 import { getExercise, getQues, delExercise } from "@/api/dataControl/exercise";
 import { ElMessage, ElMessageBox } from 'element-plus'
 const { proxy } = getCurrentInstance();
 const props = defineProps(['exerciseId', 'edit'])

 const quesData = reactive({
  quesForm: {},
  quesRules: {
   exerciseTitle: [{ required: true, message: '题目描述不能为空', trigger: 'blur' }],
   exerciseType: [{ required: true, message: '请选择类型', trigger: 'blur' }],
   choiceA: [{ required: true, message: '选项A不能为空', trigger: 'blur' }],
   choiceB: [{ required: true, message: '选项B不能为空', trigger: 'blur' }],
   choiceC: [{ required: true, message: '选项C不能为空', trigger: 'blur' }],
   choiceD: [{ required: true, message: '选项D不能为空', trigger: 'blur' }],
   correctAnswer: [{ required: true, message: '请选择正确答案', trigger: 'blur' }],
  },
 });
 const { quesForm, quesRules } = toRefs(quesData);

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
 });
 const quesList = ref([]);
 const loading = ref(false);
 const open = ref(false);
 const title = ref('');

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
        }
    })
 }

 const getExerciseQues = (parentId) => {
    getQues(parentId).then(res => {
        if(res.code === 200){
            Object.assign(quesList.value, res.data);
        }
    })
 }

 const updateQues = (ques) =>{
    reset();
    title.value="编辑题目";
    Object.assign(quesForm.value, ques);
    quesForm.value.exerciseType = quesForm.value.exerciseType + '';
    open.value=true;
 }

 const addQues = () => {
    reset();
    title.value="新增题目";
    open.value=true;
 }

 const deleteQues = (ques) => {
  ElMessageBox.confirm(
    '删除后不可恢复，是否确定删除?',
    'Warning',
    {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning',
    }
  ).then(() => {
      loading.value = true;
      delExercise(ques.id).then(res =>{
        if(res.code===200){
            ElMessage({
                type: 'success',
                message: '删除成功',
            })
            getExerciseQues(props.exerciseId);
        }else{
            ElMessage({
                type: 'fail',
                message: '删除是被',
            })
        }
      })
      loading.value = false;
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消删除',
      })
    })
 }

 const saveQues = async (formEl: FormInstance | undefined) => {
   if (!formEl) return
   await formEl.validate((valid, fields) => {
      if (valid) {
         form.parentId = props.exerciseId;
         if(form.id != -1){
            updateExercise(form).then(response => {
               if(response.code == 200){
                  ElMessage({
                   type: 'success',
                   message: '编辑成功',
                  })
                  open.value = false;
               }
            });
         }else{
            addExercise(form).then(response => {
               if(response.code == 200){
                  ElMessage({
                   type: 'success',
                   message: '新增成功',
                  })
                  open.value = false;
               }
            });
         }
         resetForm(formEl);
      }
   })
 }

 const cancel = () => {
   reset();
   open.value = false;
 }

 function reset() {
  quesForm.value = {
   id: -1,
   parentId:-1,
   exerciseTitle: '',
   choiceA: '',
   choiceB: '',
   choiceC: '',
   choiceD: '',
   correctAnswer: '',
   analysis: '',
   exerciseType: '-1',
   quesType: '-1',
  };
  proxy.resetForm("quesFormRef");
 }
 </script>
  
 <style scope>
 .el-dialog__body {
    padding-top:1px;
 }
 </style>