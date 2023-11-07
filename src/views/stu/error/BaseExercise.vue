<template>
  <div>
    <el-form ref="queryForm" :model="queryParams" :inline="true" v-show="showSearch" label-width="68px">
      <el-form-item label="题目描述" prop="exerciseTitle">
        <el-input v-model="queryParams.exerciseTitle" placeholder="请输入题目描述" />
      </el-form-item>
      <el-form-item label="备注" prop="remark">
        <el-input v-model="queryParams.remark" placeholder="请输入备注" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="Search" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" @click="resetQuery">刷新</el-button>
      </el-form-item>
    </el-form>

    <el-table v-loading="loading" :data="exerciseList" class="my-table">
      <el-table-column type="index" label="序号" align="center" width="50" />
      <el-table-column label="题目描述" align="center" prop="exerciseTitle" >
        <template #default="scope">
          <div v-html="scope.row.exerciseTitle"></div>
        </template>
      </el-table-column>
      <!-- <el-table-column label="选项A" align="center" prop="choiceA" />
      <el-table-column label="选项B" align="center" prop="choiceB" />
      <el-table-column label="选项C" align="center" prop="choiceC" />
      <el-table-column label="选项D" align="center" prop="choiceD" />
      <el-table-column label="正确答案" align="center" prop="correctAnswer" /> -->
      <el-table-column label="备注" align="center" prop="remark" />
      <el-table-column label="错误次数" align="center" prop="errorCounts" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
            <template #default="scope">
              <el-button link type="primary" icon="Search" @click="handleInfo(scope.row)">详情</el-button>
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

    <el-dialog title="题目详情" v-model="showInfo" width="1000px" append-to-body>
      <el-form ref='form1' :model="form1" label-width="80px">
        <el-row v-show="form1.remark!=null && form1.remark != ''">
          <span style="font-size:18px; font-weight:bold; height:40px"> {{ form1.remark }} </span>
        </el-row>
        <div class="ql-container ql-snow">
          <div class="ql-editor">
            <div v-html="form1.exerciseTitle"></div>
          </div>
        </div>
        <el-row :span="24" style="margin-top:20px; margin-bottom:20px">
            <el-col :span="6"> {{ "A、" + form1.choiceA }} </el-col>
            <el-col :span="6"> {{ "B、" + form1.choiceB }} </el-col>
            <el-col :span="6"> {{ "C、" + form1.choiceC }} </el-col>
            <el-col :span="6"> {{ "D、" + form1.choiceD }} </el-col>
        </el-row>
        <div style="margin-top:10px">
          <div style="font-size:15px; font-weight:bold" >答案：{{ form1.correctAnswer }}</div>
        </div>
        <div style="margin-top:10px">
          <div style="font-size:15px; font-weight:bold" >解析：{{ form1.analysis }}</div>
        </div>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import { listErrorExercise, delExercise } from "@/api/stu/error";

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
        remark: null,
        exerciseType: null,
        quesType: null,
      },
      // 表单参数
      form1: {},
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
      listErrorExercise(this.queryParams).then(response => {
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
      this.form1 = {
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
      };
      this.resetForm("form1");
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
    
    /** 查看题目详情操作 */
    handleInfo(row) {
      this.reset();
      this.form1 = row;
      this.open = false;
      this.showInfo = true;
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
  }
};
</script>
