<!-- 币币交易 下单 -->
<template>
  <div class="trade-box internationalTradeForm b-2-cl">
    <div class="title-block a-21-bg a-3-bd">
      <span
        class="tab"
        @click="switchTradeSellorBuy(false)"
        :class="{ 'a-12-bd b-1-cl': !tradeIsSell }"
      >
        <!-- 限价交易 -->
        {{ $t("trade.buy") }}
      </span>
      <span
        class="tab"
        @click="switchTradeSellorBuy(true)"
        :class="{ 'a-12-bd b-1-cl': tradeIsSell }"
      >
        <!-- 市价交易 -->
        {{ $t("trade.sell") }}
      </span>
    </div>
    <div
      class="switch-trade-type a-21-bg a-3-bd b-1-cl"
      @mouseleave="hideSelectModal"
    >
      <div class="content">
        <span @mouseenter="handMouseenter">{{
          transactionType == 1
            ? $t("trade.limitPriceTrade")
            : $t("trade.marketPriceTrade")
        }}</span>
        <svg class="icon icon-14" aria-hidden="true">
          <use xlink:href="#icon-a_13"></use>
        </svg>
        <div class="header-sub-nav a-5-bg x-2-cl" v-show="selectModalState">
          <ul class="header-user-text">
            <li class="g-3-cl-h">
              <span
                @click="switchTradeType(1)"
                :class="langHover === 'limitPriceTrade' ? 'a-4-bg b-1-cl' : ''"
                @mouseenter="handMouseenter('limitPriceTrade')"
                @mouseout="handMouseleave('limitPriceTrade')"
              >
                <!-- 限价交易 -->
                {{ $t("trade.limitPriceTrade") }}
              </span>
            </li>
            <li class="g-3-cl-h">
              <span
                @click="switchTradeType(2)"
                :class="langHover === 'marketPriceTrade' ? 'a-4-bg b-1-cl' : ''"
                @mouseenter="handMouseenter('marketPriceTrade')"
                @mouseout="handMouseleave('marketPriceTrade')"
              >
                <!-- 市价交易 -->
                {{ $t("trade.marketPriceTrade") }}
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    <div class="trade-form">
      <div class="trade-block" v-if="!tradeIsSell">
        <div class="form-block">
          <div class="top-mag">
            <span class="trade-type">
              <span>{{$t('trade.balance')}}</span>
              <span class="lovText b-1-cl">{{ currenTaccount.unitsAccoubt }}
                 {{symbolUnit.units | getCoinShowName(coinList)}}
               </span>
            </span>
            <span class="lov b-1-cl">
              <c-button
                type="text"
                class="lovButton"
                v-if="
                  this.isLogin && currenTaccount.unitsOpen.toString() === '1'
                "
                @click="goCz(symbolUnit.units)"
                >{{ $t("manageFinances.goRecharge") }}</c-button
              >
            </span>
          </div>
          <trade-input
            v-model="formData_1.value"
            :fixValue="fixValue.priceFix"
            @onChanes="onChaneForm"
            name="formData_1"
            :datas="formData_1"
          />
          <trade-input
            v-model="formData_2.value"
            :fixValue="formData2Fix"
            @onChanes="onChaneForm"
            name="formData_2"
            :datas="formData_2"
          />
          <div class="percentage">
            <span
              v-for="(item, index) in perArr"
              :key="index + 'buy'"
              :class="perBuyClass(item)"
              @click="setPerNumber('buy', item)"
              class="per-item"
              >{{ item }}%</span
            >
          </div>
          <div class="volume-trade">
            <div v-if="transactionType === 1">
              <!-- 交易额: -->
              {{ $t("trade.dealMoney") }}
              <span class="vol" v-if="tradeVolumeBuy !== '--'"
                >{{ tradeVolumeBuy }}
                {{ symbolUnit.units | getCoinShowName(coinList)}}
                </span
              >
            </div>
          </div>
          <c-button
            :defaultColorClass="buttosContent.buyButton.class"
            :hoverColorClass="buttosContent.buyButton.class"
            :activeColorClass="buttosContent.buyButton.class"
            @click="submit('BUY')"
            width="100%"
            >{{ buttosContent.buyButton.text }}</c-button
          >
        </div>
      </div>
      <div class="trade-block" v-if="tradeIsSell">
        <div class="form-block">
          <div class="top-mag">
            <span class="trade-type">
              <span>{{$t('trade.balance')}}</span>
              <span class="lovText b-1-cl">
                  {{currenTaccount.symbolAccoubt}}
                  {{symbolUnit.symbol | getCoinShowName(coinList)}}
                </span
              >
            </span>
            <span class="lov b-1-cl">
              <c-button
                type="text"
                class="lovButton"
                v-if="
                  this.isLogin && currenTaccount.unitsOpen.toString() === '1'
                "
                @click="goCz(symbolUnit.units)"
                >{{ $t("manageFinances.goRecharge") }}</c-button
              >
            </span>
          </div>
          <trade-input
            v-model="formData_3.value"
            @onChanes="onChaneForm"
            name="formData_3"
            :fixValue="fixValue.priceFix"
            :datas="formData_3"
          />
          <trade-input
            v-model="formData_4.value"
            @onChanes="onChaneForm"
            name="formData_4"
            :fixValue="fixValue.volumeFix"
            :datas="formData_4"
          />
          <div class="percentage">
            <span
              v-for="(item, index) in perArr"
              :key="index + 'sell'"
              @click="setPerNumber('sell', item)"
              class="per-item"
              :class="perSellClass(item)"
              >{{ item }}%</span
            >
          </div>
          <div class="volume-trade">
            <div v-if="transactionType === 1">
              <!-- 交易额: -->
              {{ $t("trade.dealMoney") }}
              <span
                class="vol"
                :class="
                  volumeTradeClass(
                    tradeVolumeSell,
                    currenTaccount.symbolAccoubt
                  )
                "
                v-if="tradeVolumeSell !== '--'">
                {{ tradeVolumeSell }}
                {{symbolUnit.units | getCoinShowName(coinList)}}
              </span>
            </div>
          </div>
          <c-button
            :defaultColorClass="buttosContent.sellButton.class"
            :hoverColorClass="buttosContent.sellButton.class"
            :activeColorClass="buttosContent.sellButton.class"
            @click="submit('SELL')"
            width="100%"
            >{{ buttosContent.sellButton.text }}</c-button
          >
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import 'BlockChain-ui/PC/common-mixin/modules/trade/tradeForm/internationalTradeForm/internationalTradeForm.styl';
import mixin from 'BlockChain-ui/PC/common-mixin/modules/trade/tradeForm/internationalTradeForm/internationalTradeForm';
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
