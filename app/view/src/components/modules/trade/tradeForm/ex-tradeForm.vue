<!-- 币币交易 下单 -->
<template>
  <div class="trade-box trade-box-ex-container b-2-cl">
    <div class="title-block a-21-bg a-3-bd">
      <span class="tab"
        @click="switchTradeType(1)"
        :class="{'a-12-bd b-1-cl': transactionType === 1}">
        <!-- 限价交易 -->
        {{$t('trade.limitPriceTrade')}}
      </span>
      <span class="tab"
        @click="switchTradeType(2)"
        :class="{'a-12-bd b-1-cl': transactionType === 2}">
        <!-- 市价交易 -->
        {{$t('trade.marketPriceTrade')}}
      </span>
      <span class="tab"
        v-if="showUnlockSell"
        @click="switchTradeType(3)"
        :class="{'a-12-bd b-1-cl': transactionType === 3}">
        <!-- 解锁交易 -->
        {{$t('trade.unlockTrade')}}
      </span>
      <!-- <div class="total-assets" v-if="accountBalance">
        {{$t('trade.total_money')}}
        <template v-if="totalBalancesHide">******</template>
        <template v-else>{{accountBalance.totalBalance}}</template>
        {{accountBalance.totalBalanceSymbol | getCoinShowName(coinList)}}
        <span class="b-3-cl">≈
          <template v-if="totalBalancesHide">******</template>
          <template v-else>{{totalBalances.totalRater}}</template>
        </span>
        <i class="totalBalancesHide icon"
          @click="handelTotal">
          <svg class="icon icon-16"
              aria-hidden="true"
              v-if="!totalBalancesHide">
              <use xlink:href="#icon-c_9"></use>
          </svg>
          <svg class="icon icon-16"
            v-else
            aria-hidden="true">
            <use xlink:href="#icon-c_10"></use>
          </svg>
        </i>
      </div> -->
    </div>
    <div class="trade-form" v-if="transactionType === 3">
      <div class="trade-block">
        <div class="form-block">
          <div class="top-mag">
            <!-- 占位 -->
          </div>
          <trade-input
            v-model="formData_5.value"
            @onChanes = "onChaneForm"
            name="formData_5"
            :fixValue = 'fixValue.priceFix'
            :datas="formData_5"/>
          <trade-input
            v-model="formData_6.value"
            @onChanes = "onChaneForm"
            name="formData_6"
            :fixValue = 'fixValue.volumeFix'
            :datas="formData_6"/>
          <c-button
            :defaultColorClass = 'buttosContent.sellButton.class'
            :hoverColorClass = 'buttosContent.sellButton.class'
            :activeColorClass = 'buttosContent.sellButton.class'
            @click="unlockSell"
            width="100%">
            <!-- 一键解锁卖出 -->
            {{buttosContent.unlockSellButton.text}}
          </c-button>
        </div>
      </div>
      <div class="trade-block">
        <div class="form-block model-info">
          <div class="tit">
            <svg class="icon icon-14 hover_show" aria-hidden="true">
            <use xlink:href="#icon-b_27"></use>
          </svg>
            <!-- 模式说明 -->
            {{$t('trade.modelInfo')}}
          </div>
          <div class="main-text b-1-cl">
            <!-- 模式说明说明 -->
            {{overchargeMsg}}
          </div>
        </div>
      </div>
    </div>
    <div class="trade-form" v-else>
      <div class="trade-block">
        <div class="form-block">
          <div class="top-mag">
            <span class="trade-type">
            <!-- 买入 -->
            {{$t('trade.buy')}}
            {{symbolUnit.symbol | getCoinShowName(coinList)}}
          </span>
            <span class="lov b-1-cl">
              <c-button type="text" className="lovButton"
                v-if="this.isLogin && currenTaccount.unitsOpen.toString() === '1'"
                @click="goCz(symbolUnit.units)">{{ $t('manageFinances.goRecharge') }}</c-button>
              <span class="lovText">{{currenTaccount.unitsAccoubt}}
                {{symbolUnit.units | getCoinShowName(coinList)}}
              </span>
            </span>
          </div>
          <trade-input
            v-model="formData_1.value"
            :fixValue = 'fixValue.priceFix'
            @onChanes = "onChaneForm"
            name="formData_1"
            :datas="formData_1"/>
          <trade-input
            v-model="formData_2.value"
            :fixValue = 'formData2Fix'
            @onChanes = "onChaneForm"
            name="formData_2"
            :datas="formData_2"/>
          <div class="percentage">
            <span
              v-for="(item, index) in perArr"
              :key="index + 'buy'"
              :class="perBuyClass(item)"
              @click="setPerNumber('buy', item)"
              class="per-item">{{item}}%</span>
          </div>
          <div class="volume-trade">
            <div v-if="transactionType === 1">
              <!-- 交易额: -->
              {{$t('trade.dealMoney')}}
              <span class="vol"
                    v-if="tradeVolumeBuy !== '--'">
                    {{tradeVolumeBuy}}
                    {{symbolUnit.units | getCoinShowName(coinList)}}
              </span>
            </div>
          </div>
          <c-button
            :defaultColorClass = 'buttosContent.buyButton.class'
            :hoverColorClass = 'buttosContent.buyButton.class'
            :activeColorClass = 'buttosContent.buyButton.class'
            @click="submit('BUY')"
            width="100%">
            {{buttosContent.buyButton.text}}
          </c-button>
        </div>
      </div>
      <div class="trade-block">
        <div class="form-block">
          <div class="top-mag">
            <span class="trade-type">
              <!-- 卖出 -->
              {{$t('trade.sell')}}
              {{symbolUnit.symbol | getCoinShowName(coinList)}}
            </span>
            <span class="lov b-1-cl">
              <c-button type="text" className="lovButton"
                v-if="this.isLogin && currenTaccount.symbolOpen.toString() === '1'"
                @click="goCz(symbolUnit.symbol)">{{ $t('manageFinances.goRecharge') }}</c-button>
              <span class="lovText">{{currenTaccount.symbolAccoubt}}
              {{symbolUnit.symbol | getCoinShowName(coinList)}}
            </span>
            </span>
          </div>
          <trade-input
            v-model="formData_3.value"
            @onChanes = "onChaneForm"
            name="formData_3"
            :fixValue = 'fixValue.priceFix'
            :datas="formData_3"/>
          <trade-input
            v-model="formData_4.value"
            @onChanes = "onChaneForm"
            name="formData_4"
            :fixValue = 'fixValue.volumeFix'
            :datas="formData_4"/>
          <div class="percentage">
            <span
              v-for="(item, index) in perArr"
              :key="index + 'sell'"
              @click="setPerNumber('sell', item)"
              class="per-item"
              :class="perSellClass(item)">{{item}}%</span>
          </div>
          <div class="volume-trade">
            <div v-if="transactionType === 1" class="volume-trade-opt">
              <!-- 交易额: -->
              {{$t('trade.dealMoney')}}
              <span class="vol"
                    :class="volumeTradeClass(tradeVolumeSell, currenTaccount.symbolAccoubt)"
                    v-if="tradeVolumeSell !== '--'">
                    {{tradeVolumeSell}}
                    {{symbolUnit.units | getCoinShowName(coinList)}}
              </span>
              <!-- 解锁卖出 -->
             <!--  <c-button v-if="showUnlockSell"
                @click="unlockSell"
                type="text" className="volume-trade-opt-sell">
                解锁卖出
              </c-button> -->
            </div>
          </div>
          <c-button
            :defaultColorClass = 'buttosContent.sellButton.class'
            :hoverColorClass = 'buttosContent.sellButton.class'
            :activeColorClass = 'buttosContent.sellButton.class'
            @click="submit('SELL')"
            width="100%">
            {{buttosContent.sellButton.text}}
          </c-button>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import mixin from 'BlockChain-ui/PC/common-mixin/modules/trade/tradeForm/ex-tradeForm/ex-tradeForm';
import 'BlockChain-ui/PC/common-mixin/modules/trade/tradeForm/ex-tradeForm/ex-tradeForm.styl';
import tradeInput from './tradeInput.vue';

export default {
  mixins: [mixin],
  components: {
    tradeInput,
  },
  mounted() {
    this.init();
  },
  // 组价离开前执行
  beforeDestroy() {
    clearInterval(this.assetsInter);
  },
};

</script>
