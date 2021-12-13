import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:pedala_mi/assets/custom_colors.dart';
import 'package:pedala_mi/models/loggedUser.dart';
import 'package:pedala_mi/models/reward.dart';
import 'package:pedala_mi/routes/redeemed_rewards_page.dart';
import 'package:pedala_mi/services/mongodb_service.dart';
import 'package:pedala_mi/size_config.dart';
import 'package:pedala_mi/widget/redeemed_reward_item.dart';
import 'package:pedala_mi/widget/reward_item.dart';
import 'package:persistent_bottom_nav_bar/persistent-tab-view.dart';

class RewardPage extends StatefulWidget {
  const RewardPage({Key? key}) : super(key: key);

  @override
  _RewardPageState createState() => _RewardPageState();
}

class _RewardPageState extends State<RewardPage> {
  List<Reward> rewards = [];
  late bool loading;

  refresh() {
    setState(() {});
  }

  @override
  void initState() {
    loading = true;
    WidgetsBinding.instance!.addPostFrameCallback((timeStamp) async {
      rewards = (await MongoDB.instance.getRewards())!;
      loading = false;
      setState(() {});
    });
    super.initState();
  }

  @override
  Widget build(BuildContext context) {
    String points = LoggedUser.instance!.points!.toStringAsFixed(0);
    return Scaffold(
        floatingActionButton: Container(
          height: 50,
          child: FloatingActionButton.extended(
            backgroundColor: Colors.green[600],
            heroTag: "btnShowRedeemedRewards",
            onPressed: () {
              pushNewScreen(context, screen: RedeemedRewardsPage());
            },
            label: Text("Redeemed Rewards"),
            icon: Icon(Icons.list),
          ),
        ),
        body: SingleChildScrollView(
          child: Column(
            children: [
              Container(
                color: Colors.green[600],
                height: 20 * SizeConfig.heightMultiplier!,
                width: MediaQuery.of(context).size.width,
                child: Padding(
                  padding:
                      EdgeInsets.only(top: 3 * SizeConfig.heightMultiplier!),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.center,
                    children: [
                      Text(
                        "Rewards",
                        style: TextStyle(color: Colors.white, fontSize: 40),
                      ),
                      Text(
                        "You currently have " +
                            points +
                            (points == "1" ? " point" : " points"),
                        style: TextStyle(color: Colors.white, fontSize: 15),
                      ),
                    ],
                  ),
                ),
              ),
              loading
                  ? Text("Loading...")
                  : (rewards.length == 0
                      ? Text("No rewards available")
                      : RewardItem(rewards: rewards, notifyParent: refresh)),
              SizedBox(
                height: 50,
              )
            ],
          ),
        ));
  }
}
