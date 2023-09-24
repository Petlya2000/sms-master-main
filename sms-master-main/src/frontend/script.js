const DEBUG = true;
const api = new API(`http://${window.location.host}/api/`);



let currentPage = '';
let stateDaemonWorking = false;
let commandForSupervisor = -1;
main();



async function main() 
{
  // return;
  // Timepicker.showPicker({
  //   headerBackground: '#2B2B2B',
  //   wrapperBackground: '#fff',
  //   footerBackground: '#2B2B2B',
  //   handColor: '#2B2B2B',
  //   submitColor: '#2B2B2B',
  //   cancelColor: '#2B2B2B',
  // });
  let userData = [];
  let hashValue = window.location.hash.substr(1);
  if (hashValue.length > 0)
  {
    let skipRequest = (hashValue.indexOf('invite') < 0);
    hashValue = hashValue.replace('invite', '');
    let codeValid = 0;
   
    try
    {
      if (!skipRequest)
      {
        let tmp = await api.checkInviteCode(hashValue);
        if (tmp[0] == 200)
        {
          codeValid = tmp[1]['response'];
        }
      }
    }
    catch(e){

    };

    if (!codeValid)
    {
      showMessage({
        title: 'Приглашение недействительно',
        content: 'Код из ссылки некорректен',
        buttons: 'Окей',
        callback: buildAuthForm
      });
    }
    else
    {
      let element = new Container();
      element.innerHTML = 
      `
        <div class="modalform">
        <div class="header">Регистрация нового пользователя</div>
        <div class="body">
        <div class="userInfoFields">
          <div class="info">
            <label for="lastname">фамилия <span style="color: red;">*</span></label>
            <input type="text" placeholder="Фамилия" name="lastname" required>
            <div class="margin10"></div>
            <label for="firstname">имя <span style="color: red;">*</span></label>
            <input type="text" placeholder="Имя" name="firstname" required>
            <div class="margin10"></div>
            <label for="surname">отчество</label>
            <input type="text" placeholder="Пароль" name="surname">
          </div>
          <div class="verticalLine"></div>
          <div class="creditinals">
            <label for="login">логин <span style="color: red;">*</span></label>
            <input type="text" placeholder="Логин" name="login" required>
            <div class="margin10"></div>
            <label for="password">пароль <span style="color: red;">*</span></label>
            <input type="password" placeholder="Пароль" name="password" required>
            <div class="margin10"></div>
            <label for="password_double">повторите пароль <span style="color: red;">*</span></label>
            <input type="password" placeholder="Повторите пароль" name="password_double" required>
          </div>
        </div>	
        </div>
        <div class="footer">
          <div class="button" id="registration">Регистрация</div>
        </div>
      </div>
      `;
      document.body.appendChild(element);
      document.getElementById('registration').attachEventListener("click", async function(){
        let emptyFields = [];
        let fields = [];
        this.parentNode.parentNode.querySelectorAll('input').forEach((element) => {
          if (element.value == null || element.value == '') emptyFields.push(element.getAttribute('placeholder'));
          fields[element.getAttribute('name')] = element.value;
        });
        console.log(fields);

        if (emptyFields.length != 0)
        {
          showMessage({
            title: 'Пустые поля',
            content: 'Необходимо заполнить следующие поля: ' + emptyFields.join(', '),
            buttons: 'Окей'
          });
        }
        if (fields['password'] != fields['password_double'])
        {
          showMessage({
            title: 'Пароли не совпадают',
            content: 'Проверьте введённые пароли',
            buttons: 'Окей'
          });
          return;
        }
        if (fields['password'].length < 8 || fields['login'].length < 6)
        {
          showMessage({
            title: 'Некорректные данные',
            content: 'Пароль должен быть не менее 8 символов, логин - не менее 6',
            buttons: 'Окей'
          });
          return;
        }
        let result = await api.register(hashValue, fields['login'], [fields['lastname'], fields['firstname'], fields['surname']].join(' '), fields['password']);
        if (result[0] == 200)
        {
          let result = await api.auth(fields['login'], fields['password']);
          if (result[0] == 200)
          {
            let userData = await api.accountInfo();
            buildWorkflow(userData[1]['response']);
          }
          else
          {
            history.replaceState(null, null, ' ');
            location.reload(true);
          }
          // buildWorkflow(await api.accountInfo());
        }
        else
        {
          showMessage({
            title: 'Что-то пошло не так',
            content: 'Не удалось зарегистрироваться с предоставленными данными',
            buttons: 'Окей'
          });
          return;
        }
      });
    }
    return;
  }
  else
  {
    let result = await api.checkAvailability();
    if (result)
    {
      userData = result;
      buildWorkflow(userData);
    }
    else
    {
      buildAuthForm();
    }
    
  };
  class Helper
  {
    makeUniqueId(length) {
      let result = '';
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      const charactersLength = characters.length;
      let counter = 0;
      while (counter < length) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
        counter += 1;
      }
      return result;
    }
  }
}

function showMessage({title, content, buttons, callback = null, persistent = false})
{
  let buttonsPrepared = [];
  // console.log(typeof buttons);
  if (typeof buttons == 'string')
  {
    buttonsPrepared.push(
      new AlertModalButton(
        {
            text: buttons, 
            color: AlertModalButtons.blue, 
            onTap: async () => {

              if (persistent)
              {
                let result = await callback();
                console.log(result);  
                if (typeof result == 'undefined' || result == true)
                {
                  await element.setState(0);
                  element.dispose();
                }
              }
              else
              {
                await element.setState(0);
                element.dispose();
                if (callback != null) callback();
              }
          }
        }
    ));
  }
  else
  {
    console.log(buttons);
    buttons.forEach((button, index) => {
      buttonsPrepared.push(
        new AlertModalButton(
          {
              text: button[0], 
              color: button[1], 
              onTap: async () => {
                if (persistent)
                {
                  let result = await callback[index]();
                  if (typeof result == 'undefined' || result == true)
                  {
                    await element.setState(0);
                    element.dispose();
                  }
                }
                else
                {
                  await element.setState(0);
                  element.dispose();
                  if (callback[index] != null) callback[index]();
                }
                
            }
          }
      ));
    });
  }
  let element = new AnimatedOpacity({
    opacity: 0,
    duration: new Duration({milliseconds: 100}),
    child: new BlackoutContainer({
      onTap: async function(){
        if (!persistent)
        {
          await element.setState(0);
          element.dispose();
        }
      },
      child: 
        new AlertModal(
          {
              header: title, 
              content: content,
              children: buttonsPrepared
          }
      )
    })
})
  document.body.appendChild(element);
  element.setState(1);
}


function buildAuthForm()
{
  currentPage = '';
  let element = new Container();
  element.innerHTML = 
  `
    <div class="modalform">
      <div class="header">Авторизация</div>
      <div class="body">
        <label for="login">логин <span style="color: red;">*</span></label>
        <input type="text" placeholder="Логин" name="login">
        <div class="margin10"></div>
        <label for="password">пароль <span style="color: red;">*</span></label>
        <input type="password" placeholder="Пароль" name="password">
        
      </div>
      <div class="footer">
        <div class="button" id="login" content="Войти">Войти</div>
      </div>
    </div>
  `;
  document.body.appendChild(element);

  document.getElementById('login').attachEventListener("click", async function() {
    if (this.hasAttribute('processing')) return;
    let emptyFields = [];
    let fields = [];
    this.parentNode.parentNode.querySelectorAll('input').forEach((element) => {
      if (element.value == null || element.value == '') emptyFields.push(element.getAttribute('placeholder').toLowerCase());
      if (element.getAttribute('name') != null) fields[element.getAttribute('name')] = element.value;
    });
    if (emptyFields.length != 0)
    {
      showMessage({
        title: 'Пустые поля',
        content: `${(emptyFields.length > 1 ? "Поля" : "Поле")} ${emptyFields.join(', ')} ${(emptyFields.length > 1 ? "не могут быть пустыми" : "не может быть пустым")}`,
        buttons: 'Окей'
      });
    }
    else
    {
      this.setAttribute('processing', 'processing');
      this.innerText = null;
      let response = await api.auth(fields['login'], fields['password']);
      if (!response)
      {
        showMessage({
          title: 'Некорректный логин или пароль',
          content: 'Проверьте корректность введённых данных',
          buttons: 'Окей'
        });
        this.removeAttribute('processing');
        this.innerText = this.getAttribute("content");
      }
      else
      {
        let userData = await api.accountInfo();
        buildWorkflow(userData[1]['response']);
      }
    }
  });
}


function buildWorkflow(userData)
{
  let htmlPage = `
    <div class="workflow">
      <div class="navigationPanel">
        <div class="header">
          Logged as 
          <span style="font-weight: 700">${userData['login']}</span>
          <br>
          <span style="opacity: 0.8; font-size: 14px;">${userData['screenName']}</span>
        </div>
        <div class="navigationItems">
          <div class="navigationItem" inactive>
            <img src="dashboard/icons/statistic.svg" alt="">
            <p>Статистика</p>
          </div>
          <div class="navigationItem" page="advices">
            <img src="dashboard/icons/distribution.svg" alt="">
            <p>Рассылка</p>
          </div>
          <div class="navigationItem" page="settings">
            <img src="dashboard/icons/settings.svg" alt="">
            <p>Настройки</p>
          </div>
          <div class="navigationItem" page="database">
            <img src="dashboard/icons/database.svg" alt="">
            <p>База данных</p>
          </div>
          `          
          +
          (userData['role'] != 0 ? 
          `
            <div class="navigationItem" id="inviteUser">
              <img src="dashboard/icons/invite_user.svg" alt="">
              <p>Пользователь</p>
            </div>
          `
          : '') +

          `
          <div class="navigationItem" inactive>
            <img src="dashboard/icons/blacklist.svg" alt="">
            <p>Чёрный список</p>
          </div>
        </div>
        <div class="navigationItem" id="logoutButton">
          <img src="dashboard/icons/logout.svg" alt="">
          <p>Выйти</p>
        </div>

      </div>
      <div class="pageflow" id="pageflow">
        <div class="pageHeader" id="pageHeader"><span id="pageScreenName">Рассылка</span> <div class="changeProcessState" paused></div></div>
        <div class="pageContent"></div>
      </div>
    </div>
  `;
  document.body.innerHTML = htmlPage;
  document.querySelectorAll(".navigationItem[inactive]").forEach((item) => {
    item.attachEventListener("click", function(){
      showMessage({
        title: 'Не доступно',
        content: `Этот функционал недоступен в настоящий момент`,
        buttons: 'Понятно :('
      });
      this.removeEventListeners();
    });
  });

  document.querySelectorAll(".navigationItem[page]").forEach((item) => {
    item.attachEventListener('click', function(){
      let buttonPageString = item.getAttribute('page');
      if (buttonPageString == currentPage) return;
      Paginator.push(buttonPageString);
    });
  });

  document.querySelector("#logoutButton").attachEventListener('click', function(){
    let element = new AnimatedOpacity({
      opacity: 0,
      duration: new Duration({milliseconds: 100}),
      child: new BlackoutContainer({
        onTap: async function(){
          await element.setState(0);
          element.dispose();
        },
        child: 
          new AlertModal(
            {
                header: 'Подтвердите действие', 
                content: 'Вы уверены что хотите выйти?',
                children: [
                    new AlertModalButton(
                        {
                            text: "Отмена", 
                            color: AlertModalButtons.blue, 
                            onTap: async () => {
                                await element.setState(0);
                                element.dispose();
                            }
                        }
                    ),
                    new AlertModalButton(
                        {
                            text: "Выйти", 
                            color: AlertModalButtons.red, 
                            onTap: async () => {
                              await element.setState(0);
                              element.dispose();
                              document.body.innerHTML = "";
                              api.logout();
                              buildAuthForm();
                          }
                        }
                    )
                ]
            }
        )
      })
  })
    document.body.appendChild(element);
    element.setState(1);
  });
  if (typeof(userData['defaultPasswordAlert']) != 'undefined')
  {
    showMessage({
      title: 'ВНИМАНИЕ',
      content: `Необходимо сменить пароль пользователя root`,
      buttons: [
        ['Позже', AlertModalButtons.red],
        ['Сменить', AlertModalButtons.blue]
      ],
      callback:
      [
        function(){},
        changePassword,
      ]
    });
  }
  document.querySelector(".changeProcessState").attachEventListener('click', async function(){
    if (currentPage == 'database')
    {
      let item = document.createElement('input');
      item.setAttribute('type', 'text');
      item.setAttribute('placeholder', 'Текст совета');
      item.setAttribute('id', 'adviceText');
      let container = new Container({child: item});
      container.style.width = '100%';
      container.style.display = 'flex';
      container.style.justifyContent = 'center';
      let afterContainer = new Container();
      afterContainer.appendChild(container);
      afterContainer.innerHTML += `
        <div class="checkboxes__item" style="margin-left: 23px">
          <label class="checkbox style-f">
            <input type="checkbox" id="advicePriorityState"/>
            <div class="checkbox__checkmark"></div>
            <div class="checkbox__body">Отметить как важный</div>
          </label>
        </div>
      `;
      showMessage({
        title: 'Новый совет',
        content: afterContainer,
        buttons: [
          ['отмена', AlertModalButtons.blue],
          ['создать', AlertModalButtons.green]
        ],
        callback: [
          function(){},
          async function(){
            let allowPop = false;
            let text = document.querySelector('#adviceText').value;
            console.log(text);
            if (text != '' && text != null)
            {
              let priority = document.querySelector('#advicePriorityState').checked;
              let result = await api.addAdvice(text, priority);
              if (result[0] == 200)
              {
                let newId = result[1]['response'];
                appendRowToAdvicesTable(newId, text);
                allowPop = true;
              }
              else
              {
                showMessage({
                  title: 'Ошибка',
                  content: 'Не удалось добавить совет',
                  buttons: 'Понятно'
                });
              }
            }
            // console.log(text);
            return allowPop;
          }
        ],
        persistent: true,
      });
      // <input type="text" placeholder="Логин" name="login"></input>
    }
    if (currentPage == 'advices')
    {
      let button = document.querySelector(".changeProcessState");
      button.setAttribute('await', '');
      if (button.hasAttribute('playing'))
      {
        await api.pauseAdvices();
        commandForSupervisor = 0;
      }
      else
      {
        await api.resumeAdvices();
        commandForSupervisor = 1;
      }
    }
  });
  if (userData['role'] != 0)
  {
    document.querySelector("#inviteUser").attachEventListener('click', function(){
      let afterContainer = new Container();
      let allowInvites = false;
      afterContainer.innerHTML += `
        <div class="checkboxes__item" style="margin-left: 23px">
          <label class="checkbox style-f">
            <input type="checkbox" id="allowInvites"/>
            <div class="checkbox__checkmark"></div>
            <div class="checkbox__body">Разрешить приглашать пользователей</div>
          </label>
        </div>
      `;
      showMessage({
        title: 'Пригласить пользователя',
        content: afterContainer,
        buttons: [
          ['отмена', AlertModalButtons.blue],
          ['пригласить', AlertModalButtons.green]
        ],
        callback: [
          function(){},
          function(){
            allowInvites = document.querySelector('#allowInvites').checked;
          },
        ],
        callback: [
          function(){},
          async function(){
            let tmpInviteData = await api.inviteUser(allowInvites);
            if (tmpInviteData[0] == 200)
            {
              let item = document.createElement('input');
              item.setAttribute('type', 'text');
              item.setAttribute('readonly', 'readonly');
              item.value = window.location.href + "#invite" +tmpInviteData[1]['response']['inviteCode'];
              let container = new Container({child: item});
              container.style.width = '100%';
              container.style.display = 'flex';
              container.style.justifyContent = 'center';
              showMessage({
                title: 'Скопируйте ссылку приглашения',
                content: container,
                buttons: 'готово',
              })
            }
            else
            {
                showMessage({
                  title: 'Ошибка',
                  content: 'Не удалось создать приглашение',
                  buttons: 'Понятно'
                });
            }
          }
        ],
      });
    });
  }

  Paginator.push('advices');
}

class Paginator
{
  static push(page)
  {
    currentPage = page;
    document.querySelector('#pageScreenName').innerText = Pages[page].pageScreenName
    document.querySelector('.pageContent').innerHTML = Pages[page].innerHTML;
    Pages[page].script();
    Pages[page].daemon();
  }
}

class Page
{
  pageScreenName;
  innerHTML;
  daemon;
  script;
  

  constructor({pageScreenName, innerHTML, daemon, script})
  {
    this.pageScreenName = pageScreenName;
    this.innerHTML = innerHTML;
    this.daemon = daemon;
    this.script = script;
  }
}

class Pages
{
  static settings = new Page({
    'pageScreenName': 'Настройки',
    'innerHTML': `
    <div class="settingsColumnWidget">
        <div class="settingsCategory">
          <p class="settingsSubHeader">Тайминг</p>
          <div class="settingsRowCategory">
            <div class="settingsColumnWidget" style="align-items: baseline">
              <p class="roundWidgetHeader">Интервал отправки</p>
              <div class="roundWidgetContainer">
                <div class="timerIcon"></div>
                <span id="timerSpan">0 час.</span>
              </div>
            </div>
            <div class="settingsColumnWidget">
              <p class="roundWidgetHeader">Ночной режим</p>
              <div class="roundWidgetContainer">
                <div class="nightIcon"></div>
                <span id="nightTimeFrom">00:00</span>
                <div style="height: 90%; width: 2px; background-color: black; opacity: 0.1;"></div>
                <span id="nightTimeTo">00:00</span>
                <div class="dayIcon"></div>
              </div>
            </div>
          </div>
        </div>
        <div style="margin-top: 10px;"></div>
        <div class="settingsCategory">
          <p class="settingsSubHeader">Безопасность</p>
          <div class="settingsRowCategory">
            <div class="settingsColumnWidget">
              <div style="margin-top: 5px;"></div>
              <div class="roundWidgetContainer" id="changePasswordButton">
                <div class="safetyIcon"></div>
                <span id="safetySpan">Сменить пароль</span>
              </div>
            </div>
          </div>
        </div>
    </div>
    `,
    'daemon': function(){},
    'script': async function(){
      let config = await api.getConfig();
      config = config[1].response;
      let timeInterval = config.workingTimeInterval.split('-');
      let intervalOfAdvices = config.advicesIntervalPerNumber;
      let advicesIntervalHours = Math.trunc((intervalOfAdvices/60)/60);
      let advicesIntervalMinutes = (intervalOfAdvices - ((advicesIntervalHours*60)*60)) / 60;
      // console.log(`H: ${advicesIntervalHours} | M: ${advicesIntervalMinutes}`);
      timeInterval = [timeInterval[1], timeInterval[0]];
      document.querySelector("#nightTimeFrom").innerText = timeInterval[0];
      document.querySelector("#nightTimeTo").innerText =  timeInterval[1];
      document.querySelector("#timerSpan").innerText = `${(advicesIntervalHours > 0 ? advicesIntervalHours + ' час.' : '')} ${(advicesIntervalMinutes > 0 ? advicesIntervalMinutes + ' мин.' : '')}`;
      document.querySelector("#changePasswordButton").addEventListener('click', changePassword);
      document.querySelector("#timerSpan").addEventListener('click', function(){
        updateNightTime(this, [advicesIntervalHours, advicesIntervalMinutes], async (time) => {
          if (time == '00:00')
          {
            showMessage({
              title: 'Ошибка',
              content: `Интервал отправки не может равняться нулю`,
              buttons: 'Понятно'
            });
            let advicesIntervalHours = Math.trunc((intervalOfAdvices/60)/60);
            let advicesIntervalMinutes = (intervalOfAdvices - ((advicesIntervalHours*60)*60)) / 60;
            document.querySelector("#timerSpan").innerText = `${(advicesIntervalHours > 0 ? advicesIntervalHours + ' час.' : '')} ${(advicesIntervalMinutes > 0 ? advicesIntervalMinutes + ' мин.' : '')}`;
            return;
          };
          let tmpTime = time.split(':');
          advicesIntervalHours = parseInt(tmpTime[0]);
          advicesIntervalMinutes = parseInt(tmpTime[1]);
          let newTimeSeconds = (advicesIntervalHours*60)*60 + advicesIntervalMinutes*60;
          let result = await api.updateAdvicesInterval(newTimeSeconds);
          if (result[0] != 200)
          {
            showMessage({
              title: 'Неизвестная ошибка',
              content: `Произошла неизвестная ошибка`,
              buttons: 'Понятно'
            });
            Paginator.push('settings');
          }
          config = await api.getConfig();
          config = config[1].response;
          intervalOfAdvices = config.advicesIntervalPerNumber;
          advicesIntervalHours = Math.trunc((intervalOfAdvices/60)/60);
          advicesIntervalMinutes = (intervalOfAdvices - ((advicesIntervalHours*60)*60)) / 60;
        }, function(time){
          let tmpTime = time.split(':');
          return `${(parseInt(tmpTime[0]) > 0 ? parseInt(tmpTime[0]) + " час." : "")} ${(parseInt(tmpTime[1]) > 0 ? parseInt(tmpTime[1]) + " мин." : "")}`;
        });
      });
      document.querySelector("#nightTimeFrom").addEventListener('click', function(){
        updateNightTime(this, timeInterval[0].split(':'), async (time) => {
          timeInterval[0] = time;
          if (timeInterval[0] == timeInterval[1])
          {
            showMessage({
              title: 'Ошибка',
              content: `Диапазон ночного времени не может равняться нулю`,
              buttons: 'Понятно'
            });
            timeInterval = config.workingTimeInterval.split('-');
            timeInterval = [timeInterval[1], timeInterval[0]];
            document.querySelector("#nightTimeFrom").innerText = timeInterval[0];
            document.querySelector("#nightTimeTo").innerText =  timeInterval[1];
            return;
          }
          let newInterval = [timeInterval[1], timeInterval[0]];
          let result = await api.updateWorkingTimeInterval(newInterval.join('-'));
          if (result[0] != 200)
          {
            showMessage({
              title: 'Неизвестная ошибка',
              content: `Произошла неизвестная ошибка`,
              buttons: 'Понятно'
            });
            Paginator.push('settings');
          }
          config = await api.getConfig();
          config = config[1].response;
          timeInterval = config.workingTimeInterval.split('-');
          timeInterval = [timeInterval[1], timeInterval[0]];
        });
      });
      document.querySelector("#nightTimeTo").addEventListener('click', function(){
        updateNightTime(this, timeInterval[1].split(':'), async (time) => {
          timeInterval[1] = time;
          if (timeInterval[0] == timeInterval[1])
          {
            showMessage({
              title: 'Ошибка',
              content: `Диапазон ночного времени не может равняться нулю`,
              buttons: 'Понятно'
            });            
            timeInterval = config.workingTimeInterval.split('-');
            timeInterval = [timeInterval[1], timeInterval[0]];
            document.querySelector("#nightTimeFrom").innerText = timeInterval[0];
            document.querySelector("#nightTimeTo").innerText =  timeInterval[1];
            return;
          }
          let newInterval = [timeInterval[1], timeInterval[0]];
          let result = await api.updateWorkingTimeInterval(newInterval.join('-'));
          if (result[0] != 200)
          {
            showMessage({
              title: 'Неизвестная ошибка',
              content: `Произошла неизвестная ошибка`,
              buttons: 'Понятно'
            });
            Paginator.push('settings');
          }
          config = await api.getConfig();
          config = config[1].response;
          timeInterval = config.workingTimeInterval.split('-');
          timeInterval = [timeInterval[1], timeInterval[0]];
        });
      });
      // document.querySelector("#nightTimeTo").addEventListener('click', function(){
      //   let that = this;
      //   that.classList.add('blink');
      //   Timepicker.showPicker({
      //     headerBackground: '#2B2B2B',
      //     wrapperBackground: '#fff',
      //     time: {"hours": 0, "minutes": "00"},
      //     footerBackground: '#2B2B2B',
      //     handColor: '#2B2B2B',
      //     submitColor: '#2B2B2B',
      //     cancelColor: '#2B2B2B',
      //     onSubmit: function(result){
            
      //       that.classList.remove('blink');
      //       that.innerText = result.formatted();
      //     },
      //     onCancel: function(){
      //       that.classList.remove('blink');
      //     },
      //   });
      // });
    }
  });
  static database = new Page({
    'pageScreenName': 'База данных',
    'innerHTML': `
      <div class="margin10"></div>
      <div class="widgetArea"> 
      <div class="widgetContent p50 numbersTable" id="advicesTable">
        <div class="row header">
          <div class="col10">№ совета</div>
          <div class="col70">Текст</div>
          <div class="col10">Действие</div>
        </div>
        <div class="horizontalLine"></div>
        <div class="rowDataContent"></div>
      </div>
    </div>
    `,
    'daemon': async function(){
      let button = document.querySelector('.changeProcessState');
      button.removeAttribute("paused");
      button.removeAttribute("playing");
      button.setAttribute("add", '');
      let result = await api.getAdvices();
      if (result[0] == 200)
      {
        let advices = result[1]['response'];
        advices.forEach((advice, index) => {
          appendRowToAdvicesTable(advice['id'], advice['text']);
        });
      }
      else
      {
        showMessage({
          title: 'Неизвестная ошибка',
          content: `Не удалось получить список советов`,
          buttons: 'Понятно'
        });
      }
    },
    'script': async function(){
      // appendRowToAdvicesTable
      // Pages['database'].daemon();
    }
  });
  static advices = new Page({
    'pageScreenName': 'Рассылка советов',
    'innerHTML': `
      <div class="centeredNightContainer" hidden>
        <div class="nightTimeContainer">
          <div class="nightIcon"></div>
          <div style="display: flex; flex-direction: column; justify-content: space-around; align-items: center; height: 100%;">
            <span style="font-size: 14px;"><b>Ночной режим</b></span>
            <span style="font-size: 13px;">Отправка сообщений отложена</span>
          </div>
          <div style="display: flex; flex-direction: row; justify-content: center; align-items: center; height: 100%;">
            <div style="height: 90%; width: 2px; background-color: black; opacity: 0.1;"></div>
            <span style="font-size: 14px; font-weight: 500; width: 75px; text-align: center;" id="nightTimeUntil">00:00:00</span>
          </div>
        </div>
      </div>
      <p class="widgetAreaLabel">Рассылка в реальном времени  <span class="adviceStateCircle"></span><span id="currentAdvicesState">загрузка</span></p>
      <div class="widgetArea">  
        <div class="widgetContent p50 numbersTable" id="numbersTable">
          <div class="row header">
            <div class="col15">Статус</div>
            <div class="col20">Номер телефона</div>
            <div class="col10">Совет №</div>
            <div class="col10">Отправлено</div>
            <div class="col10"></div>
          </div>
          <div class="horizontalLine"></div>
          <div class="rowDataContent"></div>
        </div>
        <div class="widgetContent rectangle ml10" style='max-height: 110px;'>
          <div class="subWidgetHeader">
            <span><b>Номеров</b></span>
            <span>активных</span>
          </div>
          <div class="counter" id="counterPhone" phone>0</div>
        </div>
        <div class="widgetContent rectangle ml10" style='max-height: 110px;'>
        <div class="subWidgetHeader">
          <span><b>Советов</b></span>
          <span>в базе</span>
        </div>
        <div class="counter" id="counterAdvices" database>0</div>
      </div>
      </div>
    `,
    'script': async function(){
      let button = document.querySelector('.changeProcessState');
      button.removeAttribute("add");
      print(stateDaemonWorking);
      if (!stateDaemonWorking)
      {
        // changeProcessState
        stateDaemonWorking = true;
        setInterval(async function() {
          if (currentPage == 'advices')
          {
            Pages['advices'].daemon();
          }
        }, 1000);
      }
    },
    'daemon': async function(){
      let tmpItem = document.getElementById('currentAdvicesState');
      let button = document.querySelector('.changeProcessState');
      let result = await api.statusAdvices();
      let text = '';
      let color = '';
      if (result[0] != 200)
      {
        text = 'ошибка';
        color = 'red';
      }
      else
      {
        // if()
        let nightContainer = document.querySelector('.centeredNightContainer');
        print(result[1]['response']['status']);
        if (result[1]['response']?.nightTimeUntil != undefined)
        {
          if (nightContainer.hasAttribute('hidden'))
          {
            nightContainer.removeAttribute('hidden');
          }
            let currentTime = Math.floor(Date.now() / 1000);
            let remainingTime = result[1]['response']?.nightTimeUntil - currentTime;
            let hours = Math.floor(remainingTime / 3600);
            let minutes = Math.floor((remainingTime % 3600) / 60);
            let seconds = remainingTime % 60;
            let formattedTime = ("0" + hours).slice(-2) + ":" + ("0" + minutes).slice(-2) + ":" + ("0" + seconds).slice(-2);
            document.querySelector('#nightTimeUntil').innerText = formattedTime;
            // Format the time with leading zeros
            

        }
        else
        {
          if (!nightContainer.hasAttribute('hidden'))
          {
            nightContainer.setAttribute('hidden', '');
          }
          
        }
        // centeredNightContainer
        if (result[1]['response']['status'] > -1)
        {
          if (commandForSupervisor == 1)
          {
            commandForSupervisor = -1;
          }
          let data = result[1]['response']['details'];
          if (data != null && data.phones.length > 0)
          {
            clearNumbersTableRows();
            data['phones'].forEach(function(phoneData){
              let phone = phoneData.phone;
              let assigned = data?.assigned?.[phone]?.id ?? 0;
              let result = data?.results?.[phone] ?? 0;
              let state = (!assigned && !result ? 'await' : (result ? (result == '200' ? 'sended' : 'error') : 'await'))
              // console.log(`append: ${state} ${phone} ${assigned} ${phoneData['sendedCount']}`);
              appendRowToNumbersTable(state, phone, assigned, phoneData['sendedCount']);
            });
            document.querySelectorAll('.rowDataContent .row[phone] .status.error').forEach((element) => {
              element.attachEventListener('click', function(){
                let phone = this.parentNode.getAttribute('phone');
                let result = data?.results?.[phone];
                let text = 'Неизвестная ошибка';
                if (result == '000')
                {
                  text = 'Не удалось связаться с шлюзом';
                }
                if (result == '400')
                {
                  text = 'Запрос к шлюзу выполнен некорректно';
                }
                showMessage({
                  title: 'Ошибка отправки смс',
                  content: text,
                  buttons: 'Понятно'
                });
                // console.log(this.parentNode.getAttribute('phone'));
              });
            });
          }
        }
        else
        {
          if (commandForSupervisor == 0)
          {
            commandForSupervisor = -1;
          }
          // appendRowToNumbersTable(state, phone, adviceId, sendedCount)
        }
        if (commandForSupervisor != -1)
        {
          if (commandForSupervisor == 1)
          {
            button.removeAttribute("playing");
            button.setAttribute("paused", '');
            button.setAttribute("await", '');
          };
          if (commandForSupervisor == 0)
          {
            button.removeAttribute("paused");
            button.setAttribute("playing", '');
            button.setAttribute("await", '');
          }
          
        }
        else
        {
          if (result[1]['response']['advicesWorking'] == 1)
          {
            button.removeAttribute("paused");
            button.setAttribute("playing", '');
          }
          else
          {
            button.removeAttribute("playing");
            button.setAttribute("paused", '');
          }
          button.removeAttribute("await");
          // button.removeAttribute("paused");
          // button.removeAttribute("playing");
        }
        

        switch (result[1]['response']['status'])
        {
          case -1:
            text = 'завершён'; color = 'grey';
          break;
          case 0:
            text = 'запускается'; color = 'grey';
          break;
          case 1:
            text = 'возобновляется'; color = 'grey';
          break;
          case 2:
            text = 'подготовка советов'; color = 'royalblue';
          break;
          case 3:
            text = 'подготовка номеров'; color = 'royalblue';
          break;
          case 4:
            text = 'привязка советов к номерам'; color = 'royalblue';
          break;
          case 5:
            text = 'работает'; color = '#27AE60';
          break;
          case 6:
            text = 'ожидает активных номеров'; color = 'orange';
          break;
          case 7:
            text = 'ожидает тексты советов'; color = 'orange';
          break;
          case 8:
            text = 'отправка сообщений отложена'; color = '#7728B5';
          break;
        }
      }
      tmpItem.innerText = text;
      tmpItem.style.color = color;
      document.querySelector('.adviceStateCircle').style.backgroundColor = color;
      // appendRowToNumbersTable(state, phone, adviceId, sendedCount)
      result = await api.getCountes();
      if (result[0] == 200)
      {
        let tmpData = result[1]['response'];
        document.querySelector('#counterPhone').innerText = tmpData['activeNumbers'];
        document.querySelector('#counterAdvices').innerText = tmpData['advicesCount'];
      }
    }
  });
}

function appendRowToNumbersTable(state, phone, adviceId, sendedCount)
{
  let states = {
    'await': 'Ожидание',
    'sended': 'Отправлено',
    'error': 'Ошибка'
  };
  
  let item = new Container();
  item.classList.add('row');
  item.setAttribute('phone', phone);
  item.innerHTML = `
    <div class="col15 status ${state}">${states[state]}</div>
    <div class="col20">${phone}</div>
    <div class="col10">${adviceId}</div>
    <div class="col10">${sendedCount}</div>
    <div class="col10 active">--</div>
`;
  document.querySelector('#numbersTable .rowDataContent').appendChild(item);
}
function clearNumbersTableRows()
{
  document.querySelector('#numbersTable .rowDataContent').innerHTML = '';
}

function appendRowToAdvicesTable(adviceId, text)
{
  let item = new Container();
  item.classList.add('row');
  item.innerHTML = `
    <div class="col10">${adviceId}</div>
    <div class="col70">${text}</div>
`;
  // <div class="col10 active" style="color: red;">удалить</div>

  let tmp = new Container();
  tmp.classList.add('col10');
  tmp.classList.add('active');
  tmp.style.color = 'red';
  tmp.innerText = 'удалить';
  let interactiveButton = new GestureDetector({
    child: tmp,
    onTap: function(){
      // console.log(adviceId);
      showMessage({
        'title': 'Необходимо подтверждение',
        'content': 'Вы уверены что хотите удалить совет №' + adviceId + '?',
        'buttons': [
          ['Отмена', AlertModalButtons.blue],
          ['Удалить', AlertModalButtons.red]
        ],
        callback: [
          function(){},
          async function() {
            // console.log('Удаляем совет #' + adviceId);
            await api.removeAdvice(adviceId);
            item.remove();

          },
        ]
      })
    }
  });
  item.appendChild(interactiveButton);
  document.querySelector('#advicesTable .rowDataContent').appendChild(item);
}


/*
    let element = new AnimatedOpacity({
      opacity: 0,
      duration: new Duration({milliseconds: 100}),
      child: new BlackoutContainer({
        onTap: async function(){
          await element.setState(0);
          element.dispose();
        },
        child: 
          new AlertModal(
            {
                header: 'Подтвердите действие', 
                text: 'Вы уверены что хоите выйти?',
                children: [
                    new AlertModalButton(
                        {
                            text: "Отмена", 
                            color: AlertModalButtons.blue, 
                            onTap: async () => {
                                await element.setState(0);
                                element.dispose();
                            }
                        }
                    ),
                    new AlertModalButton(
                        {
                            text: "Выйти", 
                            color: AlertModalButtons.red, 
                            onTap: async () => {
                              await element.setState(0);
                              element.dispose();
                              document.body.innerHTML = "";
                              api.logout();
                              buildAuthForm();
                          }
                        }
                    )
                ]
            }
        )
      })
  })
    document.body.appendChild(element);
    element.setState(1);
*/


function updateNightTime(target, predefinedTime, callback, additionalFormat = null)
{
  let that = target;
  that.classList.add('blink');

    let element = new AnimatedOpacity({
      opacity: 0,
      duration: new Duration({milliseconds: 100}),
      child: new BlackoutContainer({
        onTap: async function(){
          document.querySelector("#g-time-cancel").click();
          await element.setState(0);
          element.dispose();
        }
      }),
  });
  document.body.appendChild(element);
  element.setState(1);
  Timepicker.showPicker({
    headerBackground: '#2B2B2B',
    wrapperBackground: '#fff',
    time: {"hours": predefinedTime[0], "minutes": predefinedTime[1], "seconds": 0},
    footerBackground: '#2B2B2B',
    handColor: '#2B2B2B',
    submitColor: '#2B2B2B',
    cancelColor: '#2B2B2B',
    onSubmit: async function(result){
      
      that.classList.remove('blink');
      that.innerText = (additionalFormat != null ? additionalFormat(result.formatted()) : result.formatted());
      callback(result.formatted());
      await element.setState(0);
      element.dispose();
    },
    onCancel: async function(){
      that.classList.remove('blink');
      await element.setState(0);
      element.dispose();
    },
  });
}


function changePassword(){
  let item = document.createElement('input');
  item.setAttribute('type', 'password');
  item.setAttribute('placeholder', 'Предыдущий пароль');
  item.setAttribute('id', 'oldPassword');
  let container = new Container({child: item});
  item = document.createElement('input');
  item.setAttribute('type', 'password');
  item.setAttribute('placeholder', 'Новый пароль');
  item.setAttribute('id', 'newPassword');
  item.style.margin = '5px 0px';
  container.appendChild(item);
  item = document.createElement('input');
  item.setAttribute('type', 'password');
  item.setAttribute('placeholder', 'Повторите пароль');
  item.setAttribute('id', 'newPasswordDouble');
  item.style.margin = '5px 0px';
  container.appendChild(item);
  container.style.width = '100%';
  container.style.display = 'flex';
  container.style.alignItems = 'center';
  container.style.flexDirection = 'column';
  let afterContainer = new Container();
  afterContainer.appendChild(container);
  showMessage({
    title: 'Смена пароля',
    content: afterContainer,
    buttons: [
      ['Отмена', AlertModalButtons.red],
      ['Сменить', AlertModalButtons.blue]
    ],
    callback: [
      function(){},
      async function(){
        let allowPop = false;
        let oldPassword = document.querySelector('#oldPassword').value;
        let newPassword = document.querySelector('#newPassword').value;
        let newPasswordDouble = document.querySelector('#newPasswordDouble').value;
        if (newPassword.length < 8)
        {
          showMessage({
            title: 'Ошибка',
            content: 'Новый пароль должен быть не менее 8 символов',
            buttons: 'Понятно'
          });
          return false;
        }
        if (newPasswordDouble != newPassword)
        {
          showMessage({
            title: 'Пароли не совпадают',
            content: 'Проверьте корректность ввода нового пароля',
            buttons: 'Понятно'
          });
          return false;
        }
        let result = await api.changePassword(oldPassword, newPassword);
        if (result[0] == 200)
        {
          allowPop = true;
          showMessage({
            title: 'Уведомление',
            content: 'Пароль успешно изменён',
            buttons: 'Понятно'
          });
        }
        else
        {
          let error = result[1]['errorCode'];
          let message = '';
          if (error == 'PASSWORDS_NOT_MATCH')
          {
            message = 'Предыдущий пароль введён некорректен';
          }
          if (error == 'PASSWORD_EQUALS')
          {
            message = 'Новый пароль должен отличаться от предыдущего';
          }
          showMessage({
            title: 'Ошибка',
            content: message,
            buttons: 'Понятно'
          });
        }
        return allowPop;
      }
    ],
    persistent: true,
  })
}