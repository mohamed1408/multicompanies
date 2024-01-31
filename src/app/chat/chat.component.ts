import { Component, OnInit } from '@angular/core';
import { AuthService } from '../auth.service';
import { Message } from '../model/model';
import * as moment from 'moment'
import { SafeHtml, DomSanitizer } from '@angular/platform-browser';

declare function setHeightWidth(): any;

const svgs = [
  `<svg viewBox="0 0 12 11" height="11" width="16" preserveAspectRatio="xMidYMid meet" class="" fill="none" xmlns="http://www.w3.org/2000/svg"><title>msg-check</title><path d="M11.1549 0.652832C11.0745 0.585124 10.9729 0.55127 10.8502 0.55127C10.7021 0.55127 10.5751 0.610514 10.4693 0.729004L4.28038 8.36523L1.87461 6.09277C1.8323 6.04622 1.78151 6.01025 1.72227 5.98486C1.66303 5.95947 1.60166 5.94678 1.53819 5.94678C1.407 5.94678 1.29275 5.99544 1.19541 6.09277L0.884379 6.40381C0.79128 6.49268 0.744731 6.60482 0.744731 6.74023C0.744731 6.87565 0.79128 6.98991 0.884379 7.08301L3.88047 10.0791C4.02859 10.2145 4.19574 10.2822 4.38194 10.2822C4.48773 10.2822 4.58929 10.259 4.68663 10.2124C4.78396 10.1659 4.86436 10.1003 4.92784 10.0156L11.5738 1.59863C11.6458 1.5013 11.6817 1.40186 11.6817 1.30029C11.6817 1.14372 11.6183 1.01888 11.4913 0.925781L11.1549 0.652832Z" fill="#fff"></path></svg>`,
  `<svg viewBox="0 0 16 11" height="11" width="16" preserveAspectRatio="xMidYMid meet" class="" fill="none" xmlns="http://www.w3.org/2000/svg"><title>msg-dblcheck</title><path d="M11.0714 0.652832C10.991 0.585124 10.8894 0.55127 10.7667 0.55127C10.6186 0.55127 10.4916 0.610514 10.3858 0.729004L4.19688 8.36523L1.79112 6.09277C1.7488 6.04622 1.69802 6.01025 1.63877 5.98486C1.57953 5.95947 1.51817 5.94678 1.45469 5.94678C1.32351 5.94678 1.20925 5.99544 1.11192 6.09277L0.800883 6.40381C0.707784 6.49268 0.661235 6.60482 0.661235 6.74023C0.661235 6.87565 0.707784 6.98991 0.800883 7.08301L3.79698 10.0791C3.94509 10.2145 4.11224 10.2822 4.29844 10.2822C4.40424 10.2822 4.5058 10.259 4.60313 10.2124C4.70046 10.1659 4.78086 10.1003 4.84434 10.0156L11.4903 1.59863C11.5623 1.5013 11.5982 1.40186 11.5982 1.30029C11.5982 1.14372 11.5348 1.01888 11.4078 0.925781L11.0714 0.652832ZM8.6212 8.32715C8.43077 8.20866 8.2488 8.09017 8.0753 7.97168C7.99489 7.89128 7.8891 7.85107 7.75791 7.85107C7.6098 7.85107 7.4892 7.90397 7.3961 8.00977L7.10411 8.33984C7.01947 8.43717 6.97715 8.54508 6.97715 8.66357C6.97715 8.79476 7.0237 8.90902 7.1168 9.00635L8.1959 10.0791C8.33132 10.2145 8.49636 10.2822 8.69102 10.2822C8.79681 10.2822 8.89838 10.259 8.99571 10.2124C9.09304 10.1659 9.17556 10.1003 9.24327 10.0156L15.8639 1.62402C15.9358 1.53939 15.9718 1.43994 15.9718 1.32568C15.9718 1.1818 15.9125 1.05697 15.794 0.951172L15.4386 0.678223C15.3582 0.610514 15.2587 0.57666 15.1402 0.57666C14.9964 0.57666 14.8715 0.635905 14.7657 0.754395L8.6212 8.32715Z" fill="#fff"></path></svg>`,
  `<span style="position: absolute;left: 0px;bottom: 6px;font-size: xx-small;color: white">R</span><svg viewBox="0 0 12 11" height="11" width="16" preserveAspectRatio="xMidYMid meet" class="" fill="none" xmlns="http://www.w3.org/2000/svg"><title>msg-check</title><path d="M11.1549 0.652832C11.0745 0.585124 10.9729 0.55127 10.8502 0.55127C10.7021 0.55127 10.5751 0.610514 10.4693 0.729004L4.28038 8.36523L1.87461 6.09277C1.8323 6.04622 1.78151 6.01025 1.72227 5.98486C1.66303 5.95947 1.60166 5.94678 1.53819 5.94678C1.407 5.94678 1.29275 5.99544 1.19541 6.09277L0.884379 6.40381C0.79128 6.49268 0.744731 6.60482 0.744731 6.74023C0.744731 6.87565 0.79128 6.98991 0.884379 7.08301L3.88047 10.0791C4.02859 10.2145 4.19574 10.2822 4.38194 10.2822C4.48773 10.2822 4.58929 10.259 4.68663 10.2124C4.78396 10.1659 4.86436 10.1003 4.92784 10.0156L11.5738 1.59863C11.6458 1.5013 11.6817 1.40186 11.6817 1.30029C11.6817 1.14372 11.6183 1.01888 11.4913 0.925781L11.1549 0.652832Z" fill="#fff"></path></svg>`
]

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css']
})
export class ChatComponent implements OnInit {
  comapnyid: number
  chatindex: any[] = []
  selectedstore: number = 0
  messages: Message[] = []
  check: SafeHtml
  dbl_check: SafeHtml
  read_dbl_check: SafeHtml
  constructor(private auth: AuthService, private sanitizer: DomSanitizer) {
    this.comapnyid = 0
    this.check = sanitizer.bypassSecurityTrustHtml(svgs[0]);
    this.dbl_check = sanitizer.bypassSecurityTrustHtml(svgs[1]);
    this.read_dbl_check = sanitizer.bypassSecurityTrustHtml(svgs[2]);
    sanitizer.bypassSecurityTrustHtml("")
  }

  ngOnInit(): void {
    setHeightWidth()
    this.auth.companyid.subscribe(cid => {
      this.comapnyid = cid
      this.selectedstore = 0
      this.messages = []
      this.getchatindex()
    })
  }
  getchatindex() {
    this.auth.getchatindex(this.comapnyid).subscribe((data: any) => {
      console.log(data)
      if (data["Status"] == 200) {
        this.chatindex = data["Data"]
      }
    })
  }
  selectstore(storeid: number) {
    this.selectedstore = storeid
    this.auth.getmessages(this.selectedstore).subscribe((data: any) => {
      console.log(data)
      if (data["Status"] == 200) {
        this.messages = data["Data"]
        this.messages.forEach(msg => {
          msg.imgurl = this.sanitizer.bypassSecurityTrustUrl(msg.ImgUrl || "")
        })
      }
    })
  }
  messagecontent: string = ""
  sendmessage() {
    if (this.messagecontent != "") {
      let message = new Message()
      message.Content = this.messagecontent
      message.ImgId = null
      message.MessageDate = moment().format("YYYY-MM-DD")
      message.MessageDateTime = moment().format("YYYY-MM-DDThh:mm:ss")
      message.MessageId = 0
      message.MessageType = 1
      message.MsgTransType = 1
      message.RecieverStatus = 0
      message.StoreId = this.selectedstore
      message.UserId = null
      this.messages.push(message)
      this.messagecontent = ""
      this.auth.savemessage(message).subscribe(data => {
        // if (data["Status"] == 200) {
        //   message.MessageId = +data["Data"]
        //   this.auth.messages.next([...this.messages, message])
        // this.messagecontent = ""
        // }
      })
    }
  }
  showfiledropoverlay: boolean = false
  filetype: any = {"image": 2, "audio": 3, "video": 4}
  drop(e: DragEvent) {
    e.preventDefault()
    this.dragleave()
    if (e.dataTransfer && e.dataTransfer?.files.length > 0) {
      // console.log(e.dataTransfer.files)
      console.log(e.dataTransfer.files[0].name, e.dataTransfer.files[0].type)
      // this.selectfile(e.dataTransfer.files)
      const {name, type} = e.dataTransfer.files[0]
      let message = new Message()
      message.Content = name
      message.ImgId = null
      message.MessageDate = moment().format("YYYY-MM-DD")
      message.MessageDateTime = moment().format("YYYY-MM-DDTHH:mm:ss")
      message.MessageId = 0
      message.MessageType = this.filetype[type.split("/")[0]] || 5
      message.MsgTransType = 1
      message.RecieverStatus = 0
      message.StoreId = this.selectedstore
      message.UserId = null
      message.ImgUrl = URL.createObjectURL(e.dataTransfer.files[0])
      message.imgurl = this.sanitizer.bypassSecurityTrustUrl(message.ImgUrl)
      console.log(message)
      this.messages.push(message)
      this.auth.savefilemessage(message, e.dataTransfer.files[0]).subscribe((data: any) => {
        console.log(data)
      })
    }
  }

  allowDrop(e: DragEvent) {
    e.preventDefault()
    const { top, left, width, height } = document.getElementsByClassName("chat-body")[0].getBoundingClientRect()
    this.showfiledropoverlay = true
    $(".file-drop-overlay")[0].style.top = top + "px"
    $(".file-drop-overlay")[0].style.left = left + "px"
    $(".file-drop-overlay")[0].style.width = width + "px"
    $(".file-drop-overlay")[0].style.height = height + "px"
    $(".file-drop-overlay")[0].style.opacity = '1'
  }

  dragleave() {
    $(".file-drop-overlay")[0].style.opacity = '0'
    setTimeout(() => {
      this.showfiledropoverlay = false
    }, 200);
  }
}
