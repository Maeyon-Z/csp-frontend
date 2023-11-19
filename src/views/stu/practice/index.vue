<template>
    <div class="app-container">
      <el-form :model="queryParams" ref="queryRef" :inline="true" label-width="80px" :rules="queryRules">
        <el-form-item label="题目数量" prop="count">
            <el-input-number style="width:200px" :min="1" :max="100" v-model="queryParams.count" placeholder="请输入题目数量" @keyup.enter="handleQuery" />
        </el-form-item>
        <el-form-item label="题目类型" prop="type">
            <el-select v-model="queryParams.type" class="m-2" placeholder="请选择题型" size="large">
                <el-option
                v-for="item in typeOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
                />
            </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" icon="Search" @click="handleQuery">开始刷题</el-button>
          <el-button icon="Refresh" @click="resetQuery">重置</el-button>
        </el-form-item>
      </el-form>

      <el-tabs tab-position="left" class="demo-tabs">
        <el-tab-pane v-for="(item, idx) in exerciseList" :label="'第'+(idx+1)+'题'">
            <div v-if="item.quesType == 0" style="margin:20px">
                <el-row :span="24" style="margin-top:20px; margin-bottom:20px; font-size:30px">
                    {{ "第" + (idx+1) + "题"}}
                </el-row>
                <div style="font-size:20px" v-html="item.exerciseTitle"> </div>
                <el-radio-group :disabled="item.showAnswer" v-model="item.answer" class="ml-4" style="font-size:20px">
                    <el-radio label="A" size="large">{{ "A、" + item.choiceA }}</el-radio>
                    <el-radio label="B" size="large">{{ "B、" + item.choiceB }}</el-radio>
                    <el-radio label="C" size="large">{{ "C、" + item.choiceC }}</el-radio>
                    <el-radio label="D" size="large">{{ "D、" + item.choiceD }}</el-radio>
                </el-radio-group>
                <div v-show="item.showAnswer" style="color:red">
                    <el-row :span="24" style="margin-top:20px; margin-bottom:20px; font-size:15px">
                        你的答案：{{ item.answer == undefined ? " " :  item.answer}}
                    </el-row>
                    <el-row :span="24" style="margin-top:20px; margin-bottom:20px; font-size:15px">
                        {{"正确答案：" + item.correctAnswer }}
                    </el-row>
                    <el-row :span="24" style="margin-top:20px; margin-bottom:20px; font-size:15px">
                        {{"解析：" + item.analysis }}
                    </el-row>
                </div>
            </div>
            <div v-else style="margin:20px">
                <el-row :span="24" style="margin-top:20px; margin-bottom:20px; font-size:30px">
                    {{ "第" + (idx+1) + "题"}}
                </el-row>
                <div style="font-size:20px" v-html="item.exerciseProgram"> </div>
                <div v-for="(ques, id) in item.quesList" style="font-size:20px">
                    <div style="font-size:20px" v-html="ques.exerciseTitle"> </div>
                    <el-radio-group :disabled="item.showAnswer" v-model="ques.answer" v-show="ques.exerciseType == 0" class="ml-4" style="font-size:20px">
                        <el-radio label="A" size="large">{{ "A、" + ques.choiceA }}</el-radio>
                        <el-radio label="B" size="large">{{ "B、" + ques.choiceB }}</el-radio>
                        <el-radio label="C" size="large">{{ "C、" + ques.choiceC }}</el-radio>
                        <el-radio label="D" size="large">{{ "D、" + ques.choiceD }}</el-radio>
                    </el-radio-group>
                    <el-radio-group :disabled="item.showAnswer" v-model="ques.answer" v-show="ques.exerciseType == 1" class="ml-4" style="font-size:20px">
                        <el-radio label="正确" size="large">{{ "正确" }}</el-radio>
                        <el-radio label="错误" size="large">{{ "错误" }}</el-radio>
                    </el-radio-group>
                    <div v-show="item.showAnswer" style="color:red">
                        <el-row :span="24" style="margin-top:10px; margin-bottom:10px; font-size:15px">
                            你的答案：{{ ques.answer == undefined ? " " :  ques.answer}}
                        </el-row>
                        <el-row :span="24" style="margin-top:10px; margin-bottom:10px; font-size:15px">
                            {{"正确答案：" + ques.correctAnswer }}
                        </el-row>
                        <el-row :span="24" style="margin-top:10px; margin-bottom:10px; font-size:15px">
                            {{"解析：" + ques.analysis }}
                        </el-row>
                    </div>
                </div>
            </div>
            <el-button type="primary" v-show="!item.showAnswer" @click="submit(item)">提交并查看答案解析</el-button>
        </el-tab-pane>
      </el-tabs>

    </div>
</template>

<script setup name="Practice">
import { genExercise, submitPractice } from '@/api/stu/practice'
import { getQues } from "@/api/stu/exercise";
const { proxy } = getCurrentInstance();

const data = reactive({ 
    queryParams: {count: 20,type: '0'} ,
    queryRules:{
        count: [
            { required: true, message: "请输入题目数量", trigger: "blur" }
        ],
        type: [
            { required: true, message: "请选择题目类型", trigger: "blur" }
        ],
    },
    exerciseList: [],
});
const { queryParams, queryRules, exerciseList} = toRefs(data);

const submit = (item) => {
    item.showAnswer = true;
    if(item.quesType == 0 && item.answer != item.correctAnswer){
        submitPractice(item.id);
    }
    if(item.quesType != 0){
        let flag = false;
        item.quesList.forEach(ques => {
            if(ques.answer != ques.correctAnswer){
                flag = true;
            }
        })
        if(flag){
            submitPractice(item.id);
        }
    }
}

const typeOptions = [
  { value: '-1', label: '随机' },
  { value: '0', label: '基础题' },
  { value: '1', label: '阅读程序题'},
  { value: '2', label: '补全程序题'},
]

const handleQuery = async () => {
    proxy.$refs["queryRef"].validate(valid => {
      if (valid) {
        genExercise(queryParams.value).then(res => {
            if(res.code === 200){
                exerciseList.value = res.data;
            }
        })
      }
   })
}

watch(exerciseList, (newValue, oldValue) => {
    exerciseList.value.forEach(exercise => {   
        exercise.quesList = []
        exercise.showAnswer = false;
        if(exercise.quesType != 0){
            getQues(exercise.id).then(res => {
                if(res.code === 200){
                    exercise.quesList = res.data;
                }
            })
        }
    })
})

function resetQuery() {
    proxy.resetForm("queryRef");
    showPractice.value = false;
    exerciseList.value = [];
}
</script>