import request from '@/utils/request'

// 查询题目详细
export function genExercise(data) {
  return request({
    url: '/stu/practice/genExercise',
    method: 'post',
    data: data
  })
}