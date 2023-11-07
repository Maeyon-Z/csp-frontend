<template>
    <div>
      <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
        <el-form-item label="题目描述" prop="exerciseProgram">
          <el-input v-model="queryParams.exerciseProgram" placeholder="请输入题目描述" />
        </el-form-item>
        <el-form-item label="题目类型" prop="quesType">
            <el-select v-model="queryParams.quesType" placeholder="请选择类型" clearable>
            <el-option
                v-for="dict in sys_exercise_cate"
                :key="dict.value"
                :label="dict.label"
                :value="dict.value"
            />
            </el-select>
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
        <el-table-column label="题干程序" align="center" prop="exerciseProgram" >
          <template #default="scope">
            <div v-html="scope.row.exerciseProgram"></div>
          </template>
        </el-table-column>
        <el-table-column label="类型" align="center" prop="quesType">
          <template #default="scope">
            <dict-tag :options="sys_exercise_cate" :value="scope.row.quesType"/>
          </template>
        </el-table-column>
        <el-table-column label="备注" align="center" prop="remark" />
        <el-table-column label="错误次数" align="center" prop="errorCounts" />
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
          <template #default="scope">
            <el-button link type="primary" icon="Search" @click="handleInfo(scope.row)">详情</el-button>
            <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['stu:error:list']">删除</el-button>
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

      <el-dialog title="题目详情" v-model="openInfo" width="1020px" append-to-body>
        <EditProgramExercise :key="openInfo" :exerciseId="exerciseId"/>
      </el-dialog>
    </div>
  </template>
  
  <script setup name="ProgramExercise">
  const { proxy } = getCurrentInstance();
  const { sys_exercise_cate } = proxy.useDict("sys_exercise_cate");
  </script>
  
  <script>
  import { listErrorExercise, delExercise } from "@/api/stu/error";
  import EditProgramExercise from './EditProgramExercise.vue';
  
  export default {
    name: "ProgramExercise",
    data() {
      return {
        openInfo: false,
        exerciseId: null,
        // 遮罩层
        loading: true,
        // 显示搜索条件
        showSearch: true,
        // 总条数
        total: 0,
        // 题目表格数据
        exerciseList: [],
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          exerciseProgram: null,
          quesType: null,
          remark: null
        },
      };
    },
    created() {
      this.getList();
    },
    methods: {
      /** 查询题目列表 */
      getList() {
        this.loading = true;
        listErrorExercise(this.queryParams).then(response => {
          this.exerciseList = response.rows;
          this.total = response.total;
          this.loading = false;
        });
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
        this.exerciseId = row.id;
        this.openInfo = true;
      },
      /** 删除按钮操作 */
      handleDelete(row) {
        const ids = row.id;
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
  
<style lang="scss" scoped>
.el-dialog__body {
   padding-top:1px;
}
</style>
