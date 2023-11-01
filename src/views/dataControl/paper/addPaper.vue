<template>
    <div style="margin:20px">
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
            <el-button style="margin-left:100px" type="primary" @click="submitChangeScoreForm">保 存</el-button>
          </el-row>
        </el-form>
        <el-divider :key="sumScore.value" content-position="left" style="margin-bottom:35px">{{ "下面设置试卷题目，当前卷面总分：" +  sumScore}}</el-divider>
        <el-form ref="exerciseFormRef" :model="exerciseForm" :rules="exerciseRules" label-width="80px">
            <el-tabs type="border-card">
                <el-tab-pane label="基础题">
                    <el-row :span="24" style="margin-bottom:10px">
                        <el-button type="primary" icon="Plus" size="small" @click="handleGenBase">随机生成</el-button>
                        <el-button type="primary" icon="Plus" size="small" @click="handleAddBase">手动新增</el-button>
                    </el-row>
                    <el-table v-loading="baseLoading" :data="baseExerciseList">
                        <el-table-column type="index" label="序号" align="center" width="50" />
                        <el-table-column label="题目描述" align="center" prop="exerciseTitle" >
                            <template #default="scope">
                            <div v-html="scope.row.exerciseTitle"></div>
                            </template>
                        </el-table-column>
                        <el-table-column label="选项A" align="center" prop="choiceA" />
                        <el-table-column label="选项B" align="center" prop="choiceB" />
                        <el-table-column label="选项C" align="center" prop="choiceC" />
                        <el-table-column label="选项D" align="center" prop="choiceD" />
                        <el-table-column label="正确答案" align="center" prop="correctAnswer" />
                        <el-table-column label="备注" align="center" prop="remark" />
                        <el-table-column label="分值" align="center" prop="score" />
                        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
                            <template #default="scope">
                                <el-button link type="primary" icon="Search" @click="baseInfo(scope.row)">详情</el-button>
                                <el-button link type="primary" icon="Edit" @click="handleChangeBaseScore(scope.row)">修改分值</el-button>
                                <el-button link type="primary" icon="Delete" @click="baseDelete(scope.row)">删除</el-button>
                            </template>
                        </el-table-column>
                    </el-table>
                </el-tab-pane>
                <el-tab-pane label="阅读程序题">配置阅读程序题</el-tab-pane>
                <el-tab-pane label="补全程序题">配置补全程序题</el-tab-pane>
            </el-tabs>
        </el-form>

        <el-dialog title="随机生成基础题" v-model="showGenBase" width="500px" append-to-body>
            <el-form ref="genBaseConfigFormRef" :model="genBaseConfigForm" :rules="genBaseConfigFormRules" label-width="80px">
            <el-form-item label="题目数量" prop="count">
                <el-input-number style="width:200px" v-model="genBaseConfigForm.count" placeholder="请输入题目数量" />
            </el-form-item>
            <el-form-item label="题目分值" prop="score">
                <el-input-number style="width:200px" v-model="genBaseConfigForm.score" placeholder="请输入题目分值" />
            </el-form-item>
            </el-form>
            <div slot="footer" class="dialog-footer">
             <el-button type="primary" @click="submitGenBaseForm">确 定</el-button>
             <el-button @click="cancel">取 消</el-button>
            </div>
        </el-dialog>
        <el-dialog title="题目详情" v-model="showBaseInfo" width="1000px" append-to-body>
            <el-form ref='baseInfoFormRef' :model="baseInfoForm" label-width="80px">
                <el-row v-show="baseInfoForm.remark!=null && baseInfoForm.remark != ''">
                    <span style="font-size:18px; font-weight:bold; height:40px"> {{ baseInfoForm.remark }} </span>
                </el-row>
                <Editor :key="baseInfoForm.id" v-model="baseInfoForm.exerciseTitle" :readOnly="true" :height="300"/>
                <el-row :span="24" style="margin-top:20px; margin-bottom:20px">
                    <el-col :span="6"> {{ "A、" + baseInfoForm.choiceA }} </el-col>
                    <el-col :span="6"> {{ "B、" + baseInfoForm.choiceB }} </el-col>
                    <el-col :span="6"> {{ "C、" + baseInfoForm.choiceC }} </el-col>
                    <el-col :span="6"> {{ "D、" + baseInfoForm.choiceD }} </el-col>
                </el-row>
                <div style="font-size:15px; font-weight:bold; margin-top:10px" >答案：{{ baseInfoForm.correctAnswer }}</div>
                <div style="font-size:15px; font-weight:bold; margin-top:10px" >解析：{{ baseInfoForm.analysis }}</div>
                <div style="font-size:15px; font-weight:bold; margin-top:10px" >分值：{{ baseInfoForm.score }}</div>
            </el-form>
        </el-dialog>
        <el-dialog title="修改分数" v-model="showChangeScore" width="500px" append-to-body>
            <el-form ref='changeScoreFormRef' :model="changeScoreForm" label-width="80px" :rules="changeScoreFormRules">
                <el-form-item label="分数" prop="score">
                    <el-input-number style="width:200px" v-model="changeScoreForm.score" placeholder="请输入分数" type="text" />
                </el-form-item>
                <div slot="footer" class="dialog-footer">
                    <el-button type="primary" @click="submitChangeScoreForm">确 定</el-button>
                    <el-button @click="cancel">取 消</el-button>
                </div>
            </el-form>
        </el-dialog>
        <el-dialog title="手动新增" v-model="showAddBase" width="1300px" append-to-body>
            <el-row :span="24">
                <el-col :span="6" style="padding-right:10px">
                    <el-row> <span style="font-size:18px; font-weight:bold; height:40px"> 请选择题目 </span> </el-row>
                    <el-radio-group v-model="selectBaseId" size="small" @change="changeSelectBase">
                        <el-radio-button size="default" v-for="(data, idx) in baseIds" :label="data"> {{ idx+1 }} </el-radio-button>
                    </el-radio-group>
                </el-col>
                <el-col :span="18">
                    <el-form v-if="selectBaseId!=0" ref='baseInfoFormRef' :model="baseInfoForm" label-width="50px" :rules="baseInfoFormRules">
                        <el-row v-show="baseInfoForm.remark!=null && baseInfoForm.remark != ''">
                            <span style="font-size:18px; font-weight:bold; height:40px"> {{ baseInfoForm.remark }} </span>
                        </el-row>
                        <Editor :key="baseInfoForm.id" v-model="baseInfoForm.exerciseTitle" :readOnly="true" :height="300"/>
                        <el-row :span="24" style="margin-top:20px; margin-bottom:20px">
                            <el-col :span="6"> {{ "A、" + baseInfoForm.choiceA }} </el-col>
                            <el-col :span="6"> {{ "B、" + baseInfoForm.choiceB }} </el-col>
                            <el-col :span="6"> {{ "C、" + baseInfoForm.choiceC }} </el-col>
                            <el-col :span="6"> {{ "D、" + baseInfoForm.choiceD }} </el-col>
                        </el-row>
                        <div style="font-size:15px; font-weight:bold; margin-top:10px" >答案：{{ baseInfoForm.correctAnswer }}</div>
                        <div style="font-size:15px; font-weight:bold; margin-top:10px" >解析：{{ baseInfoForm.analysis }}</div>
                        <el-row :span="24" style="margin-top:20px">
                            <el-col :span="18">
                                <el-form-item label="分数" prop="score">
                                    <el-input-number style="width:200px" v-model="baseInfoForm.score" placeholder="请输入分数" type="text" />
                                </el-form-item>
                            </el-col>
                            <el-col :span="6"><el-button type="primary" @click="submitBaseAdd">确 定</el-button></el-col>
                        </el-row>
                    </el-form>
                </el-col>
            </el-row>
        </el-dialog>
    </div>
</template>

<script setup name="AddPaper">
import { genBase, getBaseIds } from "@/api/dataControl/paper";
import { getExercise } from "@/api/dataControl/exercise";
import { ElMessage, ElMessageBox } from 'element-plus'
const { proxy } = getCurrentInstance();

const data = reactive({
    // 试卷题目form
    paperForm: {}, paperRules: {paperName: [{ required: true, message: "试卷名称不能为空", trigger: "blur" }]},
    //总分值
    sumScore: 0,
    
    // 基础题相关参数
    genBaseConfigForm: {},
    genBaseConfigFormRules: {
        count: [{ required: true, message: "请输入题目数量", trigger: "blur" }],
        score: [{ required: true, message: "请输入每道题目分数", trigger: "blur" }]
    },
    baseExerciseList:[], baseLoading: false, baseExerciseSumScore: 0, showGenBase: false,
    showBaseInfo: false, showAddBase: false, baseIds:[],selectBaseId: 0,
    baseInfoForm:{},
    baseInfoFormRules: {
        score: [{ required: true, message: "请输入分数", trigger: "blur" }]
    },


    // 修改分数对话框相关参数
    showChangeScore:false, changeScoreForm:{},
    changeScoreFormRules: {
        score: [{ required: true, message: "分值不能为空", trigger: "blur" }]
    },

    // ======
    exerciseForm: {},
    exerciseRules: {
        paperName: [{ required: true, message: "试卷名称不能为空", trigger: "blur" }]
    },
});
const { paperForm, paperRules, sumScore
    // 基础题相关参数
    genBaseConfigForm, genBaseConfigFormRules,baseExerciseList, baseLoading,baseExerciseSumScore, 
    showGenBase,baseInfoForm,showBaseInfo,showAddBase,baseIds,selectBaseId,baseInfoFormRules,
    // 修改分数对话框参数
    showChangeScore, changeScoreForm, changeScoreFormRules,
    //
    exerciseForm, exerciseRules,
} = toRefs(data);

// 基础题相关方法                            
const handleGenBase = () => {
  reset();
  showGenBase.value = true;
}
const submitGenBaseForm = () => {
    proxy.$refs["genBaseConfigFormRef"].validate(valid => {
        if (valid) {
            baseLoading.value = true;
            genBase(genBaseConfigForm.value).then(res => {
                if(res.code === 200){
                    baseExerciseList.value = res.data;
                    sumScore.value -= baseExerciseSumScore.value;
                    baseExerciseSumScore.value = genBaseConfigForm.value.count * genBaseConfigForm.value.score;
                    sumScore.value += genBaseConfigForm.value.count * genBaseConfigForm.value.score;
                }
            })
            showGenBase.value = false;
            baseLoading.value = false;
        }
    });
}
const baseInfo = (row) => {
    reset();
    baseInfoForm.value = row;
    showBaseInfo.value = true;
}
const baseDelete = (row) => {
    baseLoading.value = true;
    const data = baseExerciseList.value.filter((item) => {
        if(item.id == row.id){
            sumScore.value -= item.score;
            baseExerciseSumScore.value -= item.score;
        }
        return item.id != row.id;
    })
    baseExerciseList.value = data;
    baseLoading.value = false;
}
const handleChangeBaseScore = (row) => {
    reset();
    changeScoreForm.value.id = row.id;
    changeScoreForm.value.score = row.score;
    showChangeScore.value = true;
}
const submitChangeScoreForm = () => {
    proxy.$refs["changeScoreFormRef"].validate(valid => {
        if (valid) {
            baseLoading.value = true;
            const data = baseExerciseList.value.filter((item) => {
                if(item.id == changeScoreForm.value.id){
                    sumScore.value -= baseExerciseSumScore.value;
                    baseExerciseSumScore.value -= item.score;
                    item.score = Number(changeScoreForm.value.score);
                    baseExerciseSumScore.value += item.score;
                    sumScore.value += baseExerciseSumScore.value;
                }
                return true;
            })
            baseExerciseList.value = data;
            showChangeScore.value = false;
            baseLoading.value = false;
        }
    })
}
const handleAddBase = () => {
    reset();
    baseIds.value = [];
    getBaseIds().then(res => {
        if(res.code === 200){
            baseIds.value = res.data;
        }
    })
    showAddBase.value = true;
}
const changeSelectBase = () => {
    getExercise(selectBaseId.value).then(res => {
        baseInfoForm.value = res.data;
    })
}
const submitBaseAdd = () => {
    proxy.$refs["baseInfoFormRef"].validate(valid => {
        if (valid) {
            const res = baseExerciseList.value.find(ele => ele.id === selectBaseId.value);
            if (!res) {
                const data = JSON.parse(JSON.stringify(baseInfoForm.value));//深拷贝
                baseExerciseList.value.push(data);
                showAddBase.value = false;
                baseExerciseSumScore.value += data.score;
                sumScore.value += data.score;
                ElMessage.success('添加成功');
            }else{
                ElMessage.error('题目已存在');
            }
            
        }
    })
    
}


function reset() {
    genBaseConfigForm.value = {
        count: undefined,
        score: undefined,
    };
    baseInfoForm.value = {
        id: null,
        exerciseTitle: '',
        choiceA: null,
        choiceB: null,
        choiceC: null,
        choiceD: null,
        correctAnswer: null,
        analysis: null,
        remark: null,
        exerciseType: 0,
        quesType: 0,
        score: 0
    };
    changeScoreForm.value = {
        id: undefined,
        score: undefined,
    };
    selectBaseId.value = 0;
    proxy.resetForm("genBaseConfigFormRef");
    proxy.resetForm("baseInfoFormRef");
    proxy.resetForm("changeScoreFormRef");
}
const cancel = () =>{
    reset();
    showGenBase.value = false;
    showChangeScore.value = false;
    showBaseInfo.value = false;
}
</script>