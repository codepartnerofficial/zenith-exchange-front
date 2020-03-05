<!-- 币币交易 实时成交 -->
<template>
    <div class="order-list-box">
      <div class="tab-box a-3-bd b-2-cl" :class="titleBlockClass">
        <span
          class="tab-item"
          v-for="(item, index) in tabTypeItem"
          :key="index + 'tab'"
          @click="switchType(index + 1)"
          :class="{'selected b-1-cl a-12-bd': orderType === index + 1}">
            {{item}}
        </span>
        <span v-if="openOrderCollect === '1'"
          class="all-order-btn u-8-cl"
          @click="goOrderPage">
          <!-- 全部订单 -->
          {{$t('trade.sellAll')}}
        </span>
      </div>
      <div class="order-conent">
        <vue-scroll>
          <c-table
            :columns = 'columns'
            :imgMap="imgMap"
            :colorMap="colorMap"
            :dataList = 'dataList'
            :subContent = 'subTableData'
            :subContentId = 'subTableDataId'
            :subColumns = 'subColumns'
            :loading = 'tableLoading'
            :subLoading = 'subLoading'
            :cellHeight = 'cellHeight'
            @elementClick = "elementClick"
            bodyClasses = 'a-7-bg'
           />
           <c-pagination v-if="(pagination.count/pagination.pageSize) > 1"
                    :total="pagination.count"
                    classes="a-7-bg"
                    :current-page='pagination.page'
                    :display='pagination.pageSize'
                    @pagechange="pagechange">
            </c-pagination>
        </vue-scroll>
      </div>
      <div class="notData a-7-bg" v-if="!dataList.length && !tableLoading">
        <svg class="icon icon-50" aria-hidden="true">
          <use xlink:href="#icon-g_2"></use>
        </svg>
        <p>
          <!-- 暂无数据 -->
          {{$t('common.notData')}}
        </p>
      </div>
    </div>
</template>
<script>
import mixin from 'BlockChain-ui/PC/common-mixin/modules/trade/orderList/orderList';
import 'BlockChain-ui/PC/common-mixin/modules/trade/orderList/orderList.styl';

export default {
  mixins: [mixin],
  mounted() {
    this.init();
  },
  // 组价离开前执行
  beforeDestroy() {
    clearInterval(this.getDataInter);
  },
};
</script>
