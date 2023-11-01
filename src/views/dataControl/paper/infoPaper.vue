    <template>
    <div>
        {{ 12312 }}
    </div>
</template>

<script setup name="InfoPaper">
import { useRoute } from "vue-router"
import { getPaper } from "@/api/dataControl/paper";

const route = useRoute();
const paperId = route.params.paperId;

const data = reactive({
  paperForm: {},
  paperRules: {
    dictName: [{ required: true, message: "字典名称不能为空", trigger: "blur" }],
    dictType: [{ required: true, message: "字典类型不能为空", trigger: "blur" }]
  },
});
const { paperForm, paperRules } = toRefs(data);


onMounted(() => {
    console.log("试卷详情" + paperId);
    getPaper(paperId).then(res => {
        if(res.code === 200){
            paperForm.value = res.data;
            console.log(paperForm.value);
        }
    })
})

</script>