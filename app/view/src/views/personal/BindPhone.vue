<template>
  <div class="bind-phone a-5-bg">
    <p class="user-management-child-header b-1-cl a-3-bd">{{$t('personal.bindPhone.title')}}</p>
    <div class="user-management-center a-5-bg">
      <div class="center-input">
        <!-- 选择国家 -->
        <c-select
          :value="country"
          :promptText="promptText"
          @onChanges='countryChange'
          name="country"
          :errorHave="true"
          :errorFlag="countryErrorFlag"
          :errorText='errorText'
          :options="countryList"
          :filterable="true"
        />
        <c-inputLine
          name="phone"
          maxLength="20"
          inputType="text"
          :promptText="promptText1"
          :errorHave="true"
          :errorText="errorText1"
          :errorFlag="checkErrorFlag1"
          marginTop="0px"
          :value="checkValue1"
          @onchanges="inputChanges"
        >
        </c-inputLine>
        <c-inputLine
          name="phoneCode"
          maxLength="6"
          inputType="text"
          :promptText="promptText2"
          :errorHave="true"
          :errorText="errorText2"
          :errorFlag="checkErrorFlag2"
          marginTop="0px"
          :value="checkValue2"
          @onchanges="inputChanges"
        >
          <!-- 获取验证码 -->
          <c-getCode
            name="phone"
            :autoStart="false"
            @click="getCodeClick('phone')"
            buttonName="loginGetcodeBtn"/>
        </c-inputLine>
        <c-inputLine
          v-if="googleCode"
          maxLength="6"
          name="googleCode"
          inputType="text"
          :promptText="promptText3"
          :errorHave="true"
          :errorText="errorText3"
          :errorFlag="checkErrorFlag3"
          marginTop="0px"
          :value="checkValue3"
          @onchanges="inputChanges"
        >
        </c-inputLine>
        <c-button type="solid"
                :big="true"
                :loading="loading"
                className=""
                paddingW="0px"
                :disabled="disabled"
                marginTop="18px"
                height="40px"
                width="100%"
                @click="btnLink">{{this.$t('personal.tool.bind')}}</c-button>
      </div>
    </div>
  </div>
</template>

<script>
import mixin from 'BlockChain-ui/PC/common-mixin/personal/BindPhone/BindPhone';
import 'BlockChain-ui/PC/common-mixin/personal/BindPhone/BindPhone.styl';

export default {
  mixins: [mixin],
  mounted() {
    this.init();
  },
};
</script>
