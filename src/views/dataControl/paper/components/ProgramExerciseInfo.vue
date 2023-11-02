<template>
 <div style="margin:10px; ">
  <el-form :model="exerciseForm" label-width="80px" ref="exerciseFormRef">
   <el-row :span="24" style="margin-bottom:10px">
    <el-col :span="20">
        <div v-if="exerciseForm.quesType==1"> <span style="font-weight:bold; font-size:20px"> {{ "阅读程序题 " + exerciseForm.remark }} </span> </div>
        <div v-else> <span style="font-weight:bold; font-size:20px"> {{ "补全程序题 " + exerciseForm.remark  }} </span> </div>
    </el-col>
    <el-col :span="4">
        <el-button v-show="add" type="primary" icon="Plus" size="default" @click="saveAddExercise">保存</el-button>
    </el-col>
   </el-row>
   <el-form-item label="题干程序" prop="exerciseProgram"> 
    <Editor v-model="exerciseForm.exerciseProgram" :readOnly="true" :height="400"/>
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
            <div style="margin-top:10px; margin-bottom:10px"> 
                <el-row :span="24">
                    <el-col :span="18">
                        <span v-show="!add"> {{ "分值：" + scoreList[idx] }} </span>
                        <div v-show="add">
                            <span> {{ "请输入分值：" }} </span>
                            <el-input-number v-model="ques.score" :min="1" :max="100" /> 
                        </div>
                    </el-col>
                    <el-col :span="6">
                        <el-button v-show="edit" type="primary" icon="Edit" size="small" @click="handleChangeScore(idx)">修改分值</el-button>
                    </el-col>
                </el-row>
            </div>
        </div>
    </el-col>
   </el-row>
  </div>
    <el-dialog title="修改分数" v-model="showChangeScore" width="500px" append-to-body>
        <el-form ref='changeScoreFormRef' :model="changeScoreForm" label-width="80px" :rules="changeScoreFormRules">
            <el-form-item label="分数" prop="score">
                <el-input-number :min="1" :max="100" style="width:200px" v-model="changeScoreForm.score" placeholder="请输入分数" type="text" />
            </el-form-item>
            <div slot="footer" class="dialog-footer">
                <el-button type="primary" @click="submitChangeScoreForm">确 定</el-button>
                <el-button @click="cancel">取 消</el-button>
            </div>
        </el-form>
    </el-dialog>
 </div>
 
</template>
  
<script setup lang=ts name="ProgramExerciseInfo">
 import { getExercise, getQues} from "@/api/dataControl/exercise";
 import { ElMessage, ElMessageBox } from 'element-plus'
 const { proxy } = getCurrentInstance();
 const props = defineProps(['exerciseId', 'edit', 'scoreList', 'add'])
 const emits = defineEmits(['scoreChange', 'addExercise'])
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
 const data = reactive({
    // 修改分数对话框相关参数
    showChangeScore:false, changeScoreForm:{},
    changeScoreFormRules: {
        score: [{ required: true, message: "分值不能为空", trigger: "blur" }]
    },
});
const {
    showChangeScore, changeScoreForm, changeScoreFormRules,
} = toRefs(data);
const quesList = ref([]);
const loading = ref(false);

const handleChangeScore = (idx) => {
    reset();
    changeScoreForm.value.id = idx;
    changeScoreForm.value.score = props.scoreList[idx];
    showChangeScore.value = true;
}
const submitChangeScoreForm = () => {
    proxy.$refs["changeScoreFormRef"].validate(valid => {
        if (valid) {
            props.scoreList[changeScoreForm.value.id] = changeScoreForm.value.score;
            const data = {};
            data.scoreList = props.scoreList;
            data.id = props.exerciseId;
            emits('scoreChange', data);
            ElMessage.success('修改成功');
            showChangeScore.value = false;
        }
    })
}
const saveAddExercise = () => {
    const data = exerciseForm;
    data.score = 0;
    data.scoreList = [];
    quesList.value.forEach(ele => {
        data.scoreList.push(ele.score);
        data.score += ele.score;
    })
    emits('addExercise', data);
}
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
function reset() {
    changeScoreForm.value = {
        id: undefined,
        score: undefined,
    };
    proxy.resetForm("changeScoreFormRef");
}
 const cancel = () =>{
    reset();
    showChangeScore.value = false;
}
 </script>
  
 <style scope>
 .el-dialog__body {
    padding-top:1px;
 }
 </style>