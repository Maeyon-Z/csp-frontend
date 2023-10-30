<template>
    <div>
      <el-form :model="queryParams" ref="queryForm" :inline="true" v-show="showSearch" label-width="68px">
        <el-form-item label="题目描述" prop="exerciseTitle">
          <el-input v-model="queryParams.exerciseTitle" placeholder="请输入题目描述" />
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
        <el-table-column label="题干程序" align="center" prop="exerciseProgram" />
        <el-table-column label="类型" align="center" prop="quesType">
          <template #default="scope">
            <dict-tag :options="sys_exercise_cate" :value="scope.row.quesType"/>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
              <template #default="scope">
                <el-button link type="primary" icon="Search" @click="handleInfo(scope.row)">详情</el-button>
                <el-button link type="primary" icon="Edit" @click="handleUpdate(scope.row)" v-hasPermi="['dataControl:exercise:edit']">修改</el-button>
                <el-button link type="primary" icon="Delete" @click="handleDelete(scope.row)" v-hasPermi="['dataControl:exercise:remove']">删除</el-button>
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
    </div>
  </template>
  
  <script setup name="ProgramExercise">
  const { proxy } = getCurrentInstance();
  const { sys_exercise_cate } = proxy.useDict("sys_exercise_cate");
  </script>
  
  <script>
  import { listExercise, getExercise, delExercise, addExercise, updateExercise } from "@/api/dataControl/exercise";
  
  export default {
    name: "ProgramExercise",
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
        // 查询参数
        queryParams: {
          pageNum: 1,
          pageSize: 10,
          exerciseTitle: null,
          quesType: null
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
        listExercise(this.queryParams).then(response => {
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
      // 多选框选中数据
      handleSelectionChange(selection) {
        this.ids = selection.map(item => item.id)
        this.single = selection.length!==1
        this.multiple = !selection.length
      },
      /** 查看题目详情操作 */
      handleInfo(row) {
        this.$router.push('/dataControl/exercise-info/info/' + row.id)
      },
      /** 新增按钮操作 */
      handleAdd() {
        this.$router.push('/dataControl/exercise-add/add')
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.$router.push('/dataControl/exercise-edit/edit/' + row.id)
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
  