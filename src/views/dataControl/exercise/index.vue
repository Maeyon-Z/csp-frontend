<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="题目描述" prop="exerciseTitle">
        <el-input v-model="queryParams.exerciseTitle" placeholder="请输入题目描述" />
      </el-form-item>
      <el-form-item label="题目类型" prop="exerciseType">
        <el-select v-model="queryParams.exerciseType" placeholder="请选择题目类型" clearable>
          <el-option
            v-for="dict in sys_exercise_type"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item label="类型" prop="quesType">
        <el-select v-model="queryParams.quesType" placeholder="请选择类型" clearable>
          <el-option
            v-for="dict in sys_exercise_cate"
            :key="dict.value"
            :label="dict.label"
            :value="dict.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button
          type="primary"
          plain
          icon="Plus"
          @click="handleAdd"
          v-hasPermi="['dataControl:exercise:add']"
        >新增</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="success"
          plain
          icon="Edit"
          :disabled="single"
          @click="handleUpdate"
          v-hasPermi="['dataControl:exercise:edit']"
        >修改</el-button>
      </el-col>
      <el-col :span="1.5">
        <el-button
          type="danger"
          plain
          icon="Delete"
          :disabled="multiple"
          @click="handleDelete"
          v-hasPermi="['dataControl:exercise:remove']"
        >删除</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button
          type="warning"
          plain
          icon="Download"
          @click="handleExport"
          v-hasPermi="['dataControl:exercise:export']"
        >导出</el-button>
      </el-col> -->
      <right-toolbar :showSearch.sync="showSearch" @queryTable="getList"></right-toolbar>
    </el-row>

    <el-table v-loading="loading" :data="exerciseList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column label="主键" align="center" prop="id" />
      <el-table-column label="题目描述" align="center" prop="exerciseTitle" />
      <el-table-column label="选项A" align="center" prop="choiceA" />
      <el-table-column label="选项B" align="center" prop="choiceB" />
      <el-table-column label="选项C" align="center" prop="choiceC" />
      <el-table-column label="选项D" align="center" prop="choiceD" />
      <el-table-column label="正确答案，对于选择题只能取A、B、C、D这四个值其中之一，对于判断题只能是 正确/错误 二者之一" align="center" prop="correctAnswer" />
      <el-table-column label="答案解析" align="center" prop="analysis" />
      <el-table-column label="题目类型 0:选择题 1:判断题" align="center" prop="exerciseType">
        <template #default="scope">
          <dict-tag :options="sys_exercise_type" :value="scope.row.exerciseType"/>
        </template>
      </el-table-column>
      <el-table-column label="类型 0:基础题 1:阅读程序 2:补全程序" align="center" prop="quesType">
        <template #default="scope">
          <dict-tag :options="sys_exercise_cate" :value="scope.row.quesType"/>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
               <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['system:dept:edit']">修改</el-button>
               <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['system:dept:edit']">删除</el-button>
            </template>
         </el-table-column>
    </el-table>
    
    <pagination
      v-show="total>0"
      :total="total"
      :page.sync="queryParams.pageNum"
      :limit.sync="queryParams.pageSize"
      @pagination="getList"
    />

    <!-- 添加或修改题目对话框 -->
    <el-dialog :title="title" v-model="open" width="500px" append-to-body>
      <el-form ref="form" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="题目描述" prop="exerciseTitle">
          <el-input v-model="form.exerciseTitle" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="选项A" prop="choiceA">
          <el-input v-model="form.choiceA" placeholder="请输入选项A" />
        </el-form-item>
        <el-form-item label="选项B" prop="choiceB">
          <el-input v-model="form.choiceB" placeholder="请输入选项B" />
        </el-form-item>
        <el-form-item label="选项C" prop="choiceC">
          <el-input v-model="form.choiceC" placeholder="请输入选项C" />
        </el-form-item>
        <el-form-item label="选项D" prop="choiceD">
          <el-input v-model="form.choiceD" placeholder="请输入选项D" />
        </el-form-item>
        <el-form-item label="正确答案，对于选择题只能取A、B、C、D这四个值其中之一，对于判断题只能是 正确/错误 二者之一" prop="correctAnswer">
          <el-input v-model="form.correctAnswer" placeholder="请输入正确答案，对于选择题只能取A、B、C、D这四个值其中之一，对于判断题只能是 正确/错误 二者之一" />
        </el-form-item>
        <el-form-item label="答案解析" prop="analysis">
          <el-input v-model="form.analysis" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="题目类型 0:选择题 1:判断题" prop="exerciseType">
          <el-radio-group v-model="form.exerciseType">
            <el-radio
              v-for="dict in sys_exercise_type"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="类型 0:基础题 1:阅读程序 2:补全程序" prop="quesType">
          <el-radio-group v-model="form.quesType">
            <el-radio
              v-for="dict in sys_exercise_cate"
              :key="dict.value"
              :label="parseInt(dict.value)"
            >{{dict.label}}</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitForm">确 定</el-button>
        <el-button @click="cancel">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="Exercise">
const { proxy } = getCurrentInstance();
const { sys_exercise_cate, sys_exercise_type } = proxy.useDict("sys_exercise_cate", "sys_exercise_type");
</script>

<script>
import { listExercise, getExercise, delExercise, addExercise, updateExercise } from "@/api/dataControl/exercise";

export default {
  name: "Exercise",
  // dicts: ['sys_exercise_cate', 'sys_exercise_type'],
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
        exerciseTitle: null,
        choiceA: null,
        choiceB: null,
        choiceC: null,
        choiceD: null,
        correctAnswer: null,
        analysis: null,
        exerciseType: null,
        quesType: null,
        isDelete: null,
        createBy: null,
        createTime: null,
        updateBy: null,
        updateTime: null
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
    /** 新增按钮操作 */
    handleAdd() {
      this.reset();
      this.open = true;
      this.title = "添加题目";
    },
    /** 修改按钮操作 */
    handleUpdate(row) {
      this.reset();
      const id = row.id || this.ids
      getExercise(id).then(response => {
        this.form = response.data;
        this.open = true;
        this.title = "修改题目";
      });
    },
    /** 提交按钮 */
    submitForm() {
      this.$refs["form"].validate(valid => {
        if (valid) {
          if (this.form.id != null) {
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
    /** 删除按钮操作 */
    handleDelete(row) {
      const ids = row.id || this.ids;
      this.$modal.confirm('是否确认删除题目编号为"' + ids + '"的数据项？').then(function() {
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
