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
        v-show="total > 0"
        :total="total"
        v-model:page="queryParams.pageNum"
        v-model:limit="queryParams.pageSize"
        @pagination="getList"
      />

      <el-dialog title="请首先录入题干程序" v-model="open" width="1000px" append-to-body>
        <el-form ref='form' :model="form" label-width="20px" :rules="rules">
          <el-form-item label="" prop="quesType">
            <el-radio-group v-model="form.quesType" class="ml-4" style="margin-bottom:0px">
                <el-radio label="1" size="large">阅读程序题</el-radio>
                <el-radio label="2" size="large">补全程序题</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="" prop="exerciseProgram">
           <Editor :key="open" v-model="form.exerciseProgram" :height="400"/>
          </el-form-item>
          <div slot="footer" class="dialog-footer" style="margin-top:10px">
            <el-button type="primary" @click="submitForm">确 定</el-button>
            <el-button @click="cancel">取 消</el-button>
          </div>
        </el-form>
      </el-dialog>

      <el-dialog title="编辑题目" v-model="openEdit" width="1020px" append-to-body>
        <EditProgramExercise :key="exerciseId" :exerciseId="exerciseId" edit="false"/>
      </el-dialog>
      <el-dialog title="题目详情" v-model="openInfo" width="1020px" append-to-body>
        <EditProgramExercise :key="exerciseId" :exerciseId="exerciseId" edit="true"/>
      </el-dialog>
    </div>
  </template>
  
  <script setup name="ProgramExercise">
  const { proxy } = getCurrentInstance();
  const { sys_exercise_cate } = proxy.useDict("sys_exercise_cate");
  </script>
  
  <script>
  import { listExercise, getExercise, delExercise, addExercise, updateExercise } from "@/api/dataControl/exercise";
  import EditProgramExercise from './EditProgramExercise.vue';
  
  export default {
    name: "ProgramExercise",
    data() {
      return {
        open:false,
        openEdit:false,
        openInfo: false,
        exerciseId: null,
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
          exerciseProgram: null,
          quesType: null
        },
        // 表单参数
        form: {},
        // 表单校验
        rules: {
          exerciseProgram: [
              { required: true, message: "题目描述不能为空", trigger: "blur" }
          ],
          quesType: [
              { required: true, message: "请选择题型", trigger: "blur" }
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
      // 表单重置
      reset() {
        this.form = {
          id: null,
          exerciseProgram: '',
          exerciseType: -1,
          quesType: '1',
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
      /** 查看题目详情操作 */
      handleInfo(row) {
        this.exerciseId = row.id;
        this.openInfo = true;
      },
      /** 新增按钮操作 */
      handleAdd() {
        this.reset();
        this.open = true;
      },
      /** 修改按钮操作 */
      handleUpdate(row) {
        this.exerciseId = row.id;
        this.openEdit = true;
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
  
<style scope>
.el-dialog__body {
   padding-top:1px;
}
</style>