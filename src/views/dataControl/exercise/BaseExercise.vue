<template>
  <div>
    <el-form :model="queryParams" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="题目描述" prop="exerciseTitle">
        <el-input v-model="queryParams.exerciseTitle" placeholder="请输入题目描述" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['dataControl:exercise:add']"
        >新增</el-button>
        <el-button icon="Refresh" @click="resetQuery">刷新</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="exerciseList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" label="序号" align="center" width="50" />
      <el-table-column label="题目描述" align="center" prop="exerciseTitle" />
      <el-table-column label="选项A" align="center" prop="choiceA" />
      <el-table-column label="选项B" align="center" prop="choiceB" />
      <el-table-column label="选项C" align="center" prop="choiceC" />
      <el-table-column label="选项D" align="center" prop="choiceD" />
      <el-table-column label="正确答案" align="center" prop="correctAnswer" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-button link type="primary" icon="Search" @click="handleInfo(scope.row)">详情</el-button>
              <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['dataControl:exercise:edit']">修改</el-button>
              <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['dataControl:exercise:remove']">删除</el-button>
            </template>
         </el-table-column>
    </el-table>
    
    <pagination
      v-show="total > 0"
      :total="total"
      v-model:page="queryParams.pageNum"
      v-model:limit="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改试卷管理对话框 -->
    <el-dialog :title="title" v-model="open" width="1000px" append-to-body>
      <el-form ref='form' :model="form" :rules="rules" label-width="80px">
        <el-form-item label="题目描述" prop="exerciseTitle">
          <Editor :key="open" v-model=form.exerciseTitle :height="400" />
        </el-form-item>
        <el-row :span="24">
          <el-col :span="12">
            <el-form-item label="选项A" prop="choiceA">
              <el-input :disabled="disabled" v-model="form.choiceA" placeholder="请输入选项A" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="选项B" prop="choiceB">
              <el-input :disabled="disabled" v-model="form.choiceB" placeholder="请输入选项B" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :span="24">
          <el-col :span="12">
            <el-form-item label="选项C" prop="choiceC">
              <el-input :disabled="disabled" v-model="form.choiceC" placeholder="请输入选项C" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="选项D" prop="choiceD">
              <el-input :disabled="disabled" v-model="form.choiceD" placeholder="请输入选项D" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="正确答案" prop="correctAnswer">
          <el-radio-group :disabled="disabled" v-model="form.correctAnswer" class="ml-4">
            <el-radio label="A" size="large">选项A</el-radio>
            <el-radio label="B" size="large">选项B</el-radio>
            <el-radio label="C" size="large">选项C</el-radio>
            <el-radio label="D" size="large">选项D</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="答案解析" prop="analysis">
          <el-input :disabled="disabled" v-model="form.analysis" placeholder="请输入答案解析" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer" v-show="!disabled">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>

    <el-dialog title="题目详情" v-model="showInfo" width="1000px" append-to-body>
      <el-form :model="form" label-width="80px">
        <div class="ql-container ql-snow">
          <div class="ql-editor">
            <div v-html="form.exerciseTitle"></div>
          </div>
        </div>
        <el-row :span="24" style="margin-top:20px; margin-bottom:20px">
            <el-col :span="6"> {{ "A、" + form.choiceA }} </el-col>
            <el-col :span="6"> {{ "B、" + form.choiceB }} </el-col>
            <el-col :span="6"> {{ "C、" + form.choiceC }} </el-col>
            <el-col :span="6"> {{ "D、" + form.choiceD }} </el-col>
        </el-row>
        <div style="margin-top:10px">
          <div style="font-size:15px; font-weight:bold" >答案：{{ form.correctAnswer }}</div>
        </div>
        <div style="margin-top:10px">
          <div style="font-size:15px; font-weight:bold" >解析：{{ form.analysis }}</div>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { listExercise, getExercise, delExercise, addExercise, updateExercise } from "@/api/dataControl/exercise";

export default {
  name: "BaseExercise",
  data() {
    return {
      // 遮罩层
      loading: true,
      // 选中数组
      ids: [],
      // 非单个禁用
      single: true,
      // 非多个禁用
      multiple: true,
      // 显示搜索条件
      showSearch: true,
      // 总条数
      total: 0,
      // 题目表格数据
      exerciseList: [],
      // 弹出层标题
      title: "",
      // 是否显示弹出层
      open: false,
      showInfo: false,
      //弹出层是否可以编辑
      disabled: false,
      // 查询参数
      queryParams: {
        pageNum: 1,
        pageSize: 10,
        exerciseTitle: null,
        exerciseType: null,
        quesType: null,
      },
      // 表单参数
      form: {},
      // 表单校验
      rules: {
        exerciseTitle: [
            { required: true, message: "题目描述不能为空", trigger: "blur" }
        ],
        choiceA: [
            { required: true, message: "选项A不能为空", trigger: "blur" }
        ],
        choiceB: [
            { required: true, message: "选项B不能为空", trigger: "blur" }
        ],
        choiceC: [
            { required: true, message: "选项C不能为空", trigger: "blur" }
        ],
        choiceD: [
            { required: true, message: "选项D不能为空", trigger: "blur" }
        ],
        correctAnswer: [
            { required: true, message: "正确答案不能为空", trigger: "blur" }
        ],
      }
    };
  },
  created() {
    this.getList();
  },
  methods: {
    /** 查询题目列表 */
    getList() {
      this.loading = true;
      this.queryParams.quesType = 0;
      this.queryParams.exerciseType = 0;
      listExercise(this.queryParams).then(response => {
        this.exerciseList = response.rows;
        this.total = response.total;
        this.loading = false;
      });
    },
    // 取消按钮
    cancel() {
      this.open = false;
      this.reset();
    },
    // 表单重置
    reset() {
      this.form = {
        id: null,
        exerciseTitle: '',
        choiceA: null,
        choiceB: null,
        choiceC: null,
        choiceD: null,
        correctAnswer: null,
        analysis: null,
        exerciseType: 0,
        quesType: 0,
      };
      this.resetForm("form");
    },
    /** 搜索按钮操作 */
    handleQuery() {
      this.queryParams.pageNum = 1;
      this.getList();
    },
    /** 重置按钮操作 */
    resetQuery() {
      this.resetForm("queryForm");
      this.handleQuery();
    },
    // 多选框选中数据
    handleSelectionChange(selection) {
      this.ids = selection.map(item => item.id)
      this.single = selection.length!==1
      this.multiple = !selection.length
    },
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null || this.form.id === -1) {
            updateExercise(this.form).then(response => {
              this.$modal.msgSuccess("修改成功");
              this.open = false;
              this.getList();
            });
          } else {
            addExercise(this.form).then(response => {
              this.$modal.msgSuccess("新增成功");
              this.open = false;
              this.getList();
            });
          }
        }
      });
    },
    /** 查看题目详情操作 */
    handleInfo(row) {
      this.reset();
      this.form = row;
      this.open = false;
      this.showInfo = true;
    },
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.title="新增题目";
      this.open = true;
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      this.title="编辑题目";
      this.form = row;
      this.open = true;
    },
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('删除后不可恢复，是否确认？').then(function() {
        return delExercise(ids);
      }).then(() => {
        this.getList();
        this.$modal.msgSuccess("删除成功");
      }).catch(() => {});
    },
    /** 导出按钮操作 */
    handleExport() {
      this.download('dataControl/exercise/export', {
        ...this.queryParams
      }, `exercise_${new Date().getTime()}.xlsx`)
    }
  }
};
</script>
